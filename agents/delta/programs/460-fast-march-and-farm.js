// programs/460-fast-march-and-farm.js
globalThis.isProgramCancelled = isCancelled;
globalThis.isCancelled = isCancelled;

console.log('=== Delta Assault & Rod Harvest Initiated ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Ensure shield is in offhand and weapon equipped
try {
  await lib.equipArmor();
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const offhand = bot.inventory.slots[45];
console.log('Offhand:', offhand?.name, 'Held:', bot.heldItem?.name);

// 2. If in overworld, enter portal and march
if (bot.game.dimension === 'overworld') {
  console.log('Entering Nether Portal (299.5, 73, -54)...');
  await enterNetherPortal(30000);
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether: currently in ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}`);
}

console.log('Now in the_nether at:', lib.fmt(bot.entity.position));

// 3. March along safe waypoints to Spawner Pillbox
bot.chat('delta: In Nether with full HP & Shield! Marching to Spawner Pillbox (36, 66, -188)...');
await marchToSpawnerPillbox();

console.log('Arrived at Pillbox vicinity:', lib.fmt(bot.entity.position));

// 4. Frontline Shield Combat & Item Vacuum at Pillbox
const pillboxTarget = new Vec3(36.0, 66.0, -187.5);
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

try {
  await bot.pathfinder.goto(new goals.GoalNear(pillboxTarget.x, pillboxTarget.y, pillboxTarget.z, 0.5));
} catch (e) {}

const spawnerPos = new Vec3(32.0, 68.0, -190.0);
await bot.lookAt(spawnerPos, true);
bot.activateItem(true); // Lock shield raised
console.log('Shield raised facing spawner (32, 68, -190)');

bot.chat('delta: Stationed at Pillbox slit with Shield! Engaging Blazes for Milestone 8!');

const combatStart = Date.now();
const maxCombatDurationMs = 240000; // 4 minutes combat loop
let lastAttack = 0;
let hits = 0;
let kills = 0;
let lastRodCount = lib.count('blaze_rod');

console.log(`Starting Blaze Rod count: ${lastRodCount}/8`);

while (!isCancelled() && Date.now() - combatStart < maxCombatDurationMs && bot.game.dimension === 'the_nether') {
  // If HP gets critically low, hold shield facing spawner
  if (bot.health <= 6) {
    bot.activateItem(true);
    await sleep(500);
    continue;
  }

  // Ensure shield is equipped in offhand
  if (bot.inventory.slots[45]?.name !== 'shield') {
    const s = bot.inventory.items().find(i => i.name === 'shield');
    if (s) {
      try { await bot.equip(s, 'off-hand'); } catch (e) {}
    }
  }

  // Find nearest valid Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    const targetAim = target.position.offset(0, (target.height || 1.8) * 0.7, 0);

    // Aim shield at target
    await bot.lookAt(targetAim, true);

    // Melee attack if within 4.5m
    if (dist <= 4.5 && Date.now() - lastAttack > 650) {
      bot.deactivateItem();
      try { await lib.equipWeapon(); } catch (e) {}
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      console.log(`Hit Blaze at ${dist.toFixed(1)}m (hit #${hits})`);

      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`Blaze eliminated! Total kills: ${kills}`);
      }

      await sleep(35);
      bot.activateItem(true); // Immediately re-raise shield!
    } else {
      bot.activateItem(true);
    }
  } else {
    // Face spawner with shield raised
    await bot.lookAt(spawnerPos, true);
    bot.activateItem(true);
  }

  // Check for dropped items within reach
  const nearbyDrops = Object.values(bot.entities).filter(e =>
    e.name === 'item' &&
    bot.entity.position.distanceTo(e.position) <= 2.8 &&
    e.position.x >= 34.0 && // Safe floor area
    e.position.y >= 65.0 &&
    e.position.z <= -185.0
  );

  for (const drop of nearbyDrops) {
    const dPos = drop.position;
    // Step forward safely only within pillbox bounds
    if (dPos.x >= 35.0 && dPos.x <= 37.0 && dPos.z >= -189.0 && dPos.z <= -186.0) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(dPos.x, dPos.y, dPos.z, 0.4));
      } catch (e) {}
    }
  }

  // Track Blaze Rod count
  const curRods = lib.count('blaze_rod');
  if (curRods > lastRodCount) {
    bot.chat(`delta: Harvested Blaze Rod! Delta holds ${curRods}/8!`);
    console.log(`*** Blaze Rod Harvested! Total: ${curRods}/8 ***`);
    lastRodCount = curRods;
  }

  if (curRods >= 8) {
    bot.chat(`delta: Milestone 8 Target Reached! ${curRods} Blaze Rods secured in inventory!`);
    console.log(`Milestone 8 Reached: ${curRods} Blaze Rods!`);
    break;
  }

  await sleep(100);
}

bot.deactivateItem();
const finalRods = lib.count('blaze_rod');
console.log(`Combat finished. Rods: ${finalRods}, Hits: ${hits}, Kills: ${kills}, HP: ${bot.health}`);
bot.chat(`delta: Frontline combat cycle ended. Rods held: ${finalRods}/8, HP: ${bot.health.toFixed(1)}`);

// 5. If target reached, retreat and deposit
if (finalRods >= 8) {
  bot.chat('delta: Slaying complete! Retreating to Overworld base to deposit Blaze Rods.');
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
