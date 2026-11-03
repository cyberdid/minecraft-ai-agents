// programs/448-spawner-slayer-continuous.js
globalThis.isCancelled = isCancelled;

console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Equip shield in offhand and sword in main hand
try {
  await lib.equipArmor();
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const offhand = bot.inventory.slots[45];
console.log('Offhand:', offhand?.name, 'Held:', bot.heldItem?.name);

// 2. Lock position at safe pillbox slit: (37.0, 66.0, -186.5)
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

try {
  await bot.pathfinder.goto(new goals.GoalNear(37.0, 66.0, -186.5, 0.4));
} catch (e) {}

// Raise shield immediately
bot.activateItem(true);
console.log('Shield raised in offhand!');
bot.chat(`delta: Slaying Blazes through Pillbox slit with Shield! Harvesting Blaze Rods for Milestone 8.`);

// 3. Combat loop
const farmDurationMs = 280000; // 4.6 minutes
const startTime = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let hits = 0;
let killed = 0;

console.log(`Starting continuous Blaze slayer loop. Initial Blaze Rods: ${lastRods}`);

while (!isCancelled() && Date.now() - startTime < farmDurationMs) {
  // If HP gets critical, step back behind full wall at x=38.0
  if (bot.health <= 4.0) {
    console.log(`HP critical (${bot.health.toFixed(1)}), taking cover behind wall...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(38.0, 66.0, -185.0, 0.4));
      await sleep(3000);
      await bot.pathfinder.goto(new goals.GoalNear(37.0, 66.0, -186.5, 0.4));
    } catch (e) {}
    bot.activateItem(true);
  }

  // Find nearest Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    if (dist <= 4.8 && Date.now() - lastAttack > 625) {
      bot.deactivateItem();
      try { await lib.equipWeapon(); } catch (e) {}
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      console.log(`Hit Blaze #${target.id} at dist ${dist.toFixed(1)}m (hit #${hits})`);
      if (target.health !== undefined && target.health <= 0) {
        killed++;
        console.log(`Killed Blaze! Total killed: ${killed}`);
      }
      await sleep(60);
      bot.activateItem(true); // shield back up!
    }
  }

  // Safe item vacuum: collect any drops that landed near slit (x >= 35.0, z <= -185.0)
  const safeItems = Object.values(bot.entities).filter(e => 
    e.name === 'item' && 
    bot.entity.position.distanceTo(e.position) <= 3.5 &&
    e.position.x >= 35.0 &&
    e.position.z <= -185.0
  );
  for (const item of safeItems) {
    if (bot.entity.position.distanceTo(item.position) > 0.8) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.4));
      } catch (e) {}
    }
  }

  // Check Blaze Rods count
  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`delta: Harvested Blaze Rod! Total: ${curRods}/8`);
    console.log(`Harvested Blaze Rod! Total: ${curRods}/8`);
    lastRods = curRods;
  }

  if (curRods >= 8) {
    console.log('Milestone 8 target reached: 8+ Blaze Rods!');
    bot.chat(`delta: Milestone 8 Target Reached: ${curRods} Blaze Rods!`);
    break;
  }

  await sleep(100);
}

const finalRods = lib.count('blaze_rod');
console.log(`Combat cycle end. Total hits: ${hits}, Killed: ${killed}, Rods: ${finalRods}/8, HP: ${bot.health}`);
bot.chat(`delta: Combat round complete. Blaze Rods held: ${finalRods}/8, HP: ${bot.health.toFixed(1)}`);

// If 8 rods reached, retreat to Overworld base to deposit!
if (finalRods >= 8) {
  bot.chat('delta: Milestone 8 COMPLETE! Retreating to Overworld base to deposit Blaze Rods.');
  console.log('Retreating to Overworld base...');
  const retRes = await retreatToOverworldBase();
  console.log('Retreat result:', JSON.stringify(retRes));

  if (bot.game.dimension === 'overworld') {
    try {
      await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
      bot.chat('delta: Deposited all Blaze Rods into base chest (293, 72, -57)! Milestone 8 100% COMPLETE!');
    } catch (e) {}
  }
}
