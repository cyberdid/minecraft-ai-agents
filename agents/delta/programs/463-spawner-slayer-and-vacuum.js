// programs/463-spawner-slayer-and-vacuum.js
globalThis.isProgramCancelled = isCancelled;
globalThis.isCancelled = isCancelled;

console.log('=== Delta Spawner Slayer & Vacuum Activated ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Position Delta cleanly at the frontline slit (35.6, 66.0, -187.5)
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

const targetPos = new Vec3(35.6, 66.0, -187.5);
if (bot.entity.position.distanceTo(targetPos) > 0.4) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(targetPos.x, targetPos.y, targetPos.z, 0.3));
  } catch (e) {}
}

// 2. Ensure shield in offhand
try {
  await lib.equipArmor();
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

const equipBestWeapon = async () => {
  const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
  const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
  const w = sword || pick;
  if (w && bot.heldItem?.name !== w.name) {
    try { await bot.equip(w, 'hand'); } catch (e) {}
  }
};
await equipBestWeapon();

const spawnerPos = new Vec3(32.0, 68.0, -190.0);
await bot.lookAt(spawnerPos, true);
bot.activateItem(true); // Raise shield

console.log('Delta locked in frontline slit! Shield raised facing spawner.');
bot.chat('delta: Frontline Pillbox Stance (35.6, 66, -187.5) with Shield! Slaying Blazes for Milestone 8.');

const combatStart = Date.now();
const combatDurationMs = 240000; // 4 minutes
let lastAttack = 0;
let hits = 0;
let kills = 0;
let lastRods = lib.count('blaze_rod');

console.log(`Initial Blaze Rods held: ${lastRods}/8`);

while (!isCancelled() && Date.now() - combatStart < combatDurationMs && bot.game.dimension === 'the_nether') {
  // If HP gets low, hold shield
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

  // Sort valid blazes by distance
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    const targetAim = target.position.offset(0, (target.height || 1.8) * 0.7, 0);

    // Aim shield at target
    await bot.lookAt(targetAim, true);

    // Strike if within 4.6m
    if (dist <= 4.6 && Date.now() - lastAttack > 625) {
      bot.deactivateItem();
      await equipBestWeapon();
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      console.log(`Hit Blaze at ${dist.toFixed(1)}m (total hits: ${hits})`);

      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`Blaze eliminated! Total kills: ${kills}`);
      }

      await sleep(35);
      bot.activateItem(true); // Re-raise shield immediately!
    } else {
      bot.activateItem(true);
    }
  } else {
    await bot.lookAt(spawnerPos, true);
    bot.activateItem(true);
  }

  // Check for dropped items nearby
  const items = Object.values(bot.entities).filter(e =>
    e.name === 'item' &&
    bot.entity.position.distanceTo(e.position) <= 3.2 &&
    e.position.x >= 34.5 && // Never fall off west edge
    e.position.y >= 65.0 &&
    e.position.z <= -185.0
  );

  // If items dropped on the floor, step slightly to vacuum
  for (const it of items) {
    const ip = it.position;
    if (ip.x >= 34.8 && ip.x <= 36.5 && ip.z >= -189.0 && ip.z <= -186.5) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(ip.x, ip.y, ip.z, 0.4));
      } catch (e) {}
    }
  }

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
console.log(`Combat cycle end. Rods: ${finalRods}/8, Hits: ${hits}, Kills: ${kills}, HP: ${bot.health}`);
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
