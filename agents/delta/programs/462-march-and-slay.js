// programs/462-march-and-slay.js
globalThis.isProgramCancelled = isCancelled;
globalThis.isCancelled = isCancelled;

console.log('Delta starting march from:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

if (bot.game.dimension !== 'the_nether') {
  console.log('Not in Nether, entering portal...');
  await enterNetherPortal(30000);
}

// 1. March to Spawner Pillbox using the tested waypoints
bot.chat('delta: In Nether with full 20 HP & Shield! Marching to Spawner Pillbox (36, 66, -188)...');
const marchRes = await marchToSpawnerPillbox();
console.log('March complete result:', JSON.stringify(marchRes));

// 2. Lock position at Pillbox firing slit (36.0, 66.0, -187.5)
const pillboxPos = new Vec3(36.0, 66.0, -187.5);
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

try {
  await bot.pathfinder.goto(new goals.GoalNear(pillboxPos.x, pillboxPos.y, pillboxPos.z, 0.5));
} catch (e) {}

const spawnerTarget = new Vec3(32.0, 68.0, -190.0);
await bot.lookAt(spawnerTarget, true);
bot.activateItem(true); // Raise shield
console.log('Stationed inside Pillbox! Shield raised facing spawner.');
bot.chat('delta: Stationed at Pillbox slit with Shield! Engaging Blazes for Milestone 8.');

const combatStart = Date.now();
const combatDurationMs = 200000; // 3.3 minutes
let lastAttack = 0;
let hits = 0;
let kills = 0;
let lastRods = lib.count('blaze_rod');

while (!isCancelled() && Date.now() - combatStart < combatDurationMs && bot.game.dimension === 'the_nether') {
  // If HP low, hold shield facing spawner
  if (bot.health <= 6) {
    bot.activateItem(true);
    await sleep(500);
    continue;
  }

  // Ensure shield is in offhand
  if (bot.inventory.slots[45]?.name !== 'shield') {
    const s = bot.inventory.items().find(i => i.name === 'shield');
    if (s) {
      try { await bot.equip(s, 'off-hand'); } catch (e) {}
    }
  }

  // Sort blazes by distance
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    const targetAim = target.position.offset(0, (target.height || 1.8) * 0.7, 0);

    // Aim shield at target
    await bot.lookAt(targetAim, true);

    // Strike if within 4.5m
    if (dist <= 4.5 && Date.now() - lastAttack > 650) {
      bot.deactivateItem();
      try { await lib.equipWeapon(); } catch (e) {}
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      console.log(`Hit Blaze at ${dist.toFixed(1)}m (total hits: ${hits})`);

      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`Blaze eliminated! Total kills: ${kills}`);
      }

      await sleep(35);
      bot.activateItem(true); // Re-raise shield immediately
    } else {
      bot.activateItem(true);
    }
  } else {
    await bot.lookAt(spawnerTarget, true);
    bot.activateItem(true);
  }

  // Vacuum any dropped items within safe pillbox reach
  const droppedItems = Object.values(bot.entities).filter(e =>
    e.name === 'item' &&
    bot.entity.position.distanceTo(e.position) <= 2.8 &&
    e.position.x >= 34.5 && // Never step off west ledge
    e.position.y >= 65.0 &&
    e.position.z <= -185.0
  );

  for (const item of droppedItems) {
    const ip = item.position;
    if (ip.x >= 35.0 && ip.x <= 37.0 && ip.z >= -189.0 && ip.z <= -186.0) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(ip.x, ip.y, ip.z, 0.4));
      } catch (e) {}
    }
  }

  // Track rod count
  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`delta: Harvested Blaze Rod! Delta holds ${curRods}/8!`);
    console.log(`*** Blaze Rod Harvested! Delta holds ${curRods}/8 ***`);
    lastRods = curRods;
  }

  if (curRods >= 8) {
    bot.chat(`delta: Milestone 8 Target Reached! ${curRods} Blaze Rods secured!`);
    console.log(`Milestone 8 Reached: ${curRods} Blaze Rods!`);
    break;
  }

  await sleep(100);
}

bot.deactivateItem();
const finalRods = lib.count('blaze_rod');
console.log(`Pillbox session complete. Rods: ${finalRods}/8, Hits: ${hits}, Kills: ${kills}, HP: ${bot.health}`);
bot.chat(`delta: Combat round complete. Blaze Rods held: ${finalRods}/8, HP: ${bot.health.toFixed(1)}`);

if (finalRods >= 8) {
  bot.chat('delta: 8+ Blaze Rods secured! Retreating to Overworld base to deposit.');
  await retreatToOverworldBase();
  if (bot.game.dimension === 'overworld') {
    try {
      await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
      bot.chat('delta: Deposited all Blaze Rods in base chest (293, 72, -57)! Milestone 8 100% COMPLETE!');
    } catch (e) {
      console.log('Deposit error:', e.message);
    }
  }
}

return {
  pos: bot.entity.position,
  dimension: bot.game.dimension,
  rods: finalRods,
  hp: bot.health,
  hits,
  kills
};
