// programs/369-team-spawner-harvest.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Scan for item drops within 10m
const groundDrops = Object.values(bot.entities).filter(e => e && e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 10);
console.log(`Ground items nearby: ${groundDrops.length}`);
for (const drop of groundDrops) {
  console.log(`  Item drop at ${lib.fmt(drop.position)} (dist: ${bot.entity.position.distanceTo(drop.position).toFixed(1)}m)`);
}

// Pickup drops
try {
  const p = await lib.pickup(8);
  console.log('Picked up items:', p);
} catch (e) {}

// 2. Equip best weapons & armor
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const held = bot.entity.heldItem?.name;
console.log('Held item:', held, 'Offhand:', bot.inventory.slots[45]?.name);

// Check if Beta is nearby
const beta = Object.values(bot.players).find(p => p.username === 'beta')?.entity;
if (beta) {
  console.log(`Teammate Beta beside us at ${lib.fmt(beta.position)} (dist: ${bot.entity.position.distanceTo(beta.position).toFixed(1)}m)!`);
}

bot.chat(`delta: Fighting beside Beta in Spawner Pillbox! Held: ${held || 'fists'}, HP: ${bot.health}/20`);

// 3. Combat Loop: strike Blazes through slit without moving past guardrails
const startTime = Date.now();
let rods = lib.count('blaze_rod');

while (!isCancelled() && (Date.now() - startTime < 50000) && bot.health > 6) {
  // Try to equip sword if available
  const sword = bot.inventory.items().find(i => i.name.includes('sword'));
  if (sword && bot.entity.heldItem?.name !== sword.name) {
    try { await bot.equip(sword, 'hand'); } catch (e) {}
  }

  // Find nearest Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e && e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) <= 5.5)
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  if (blazes.length > 0) {
    const target = blazes[0];
    console.log(`Striking Blaze at ${lib.fmt(target.position)} (dist: ${bot.entity.position.distanceTo(target.position).toFixed(1)}m)!`);
    await bot.lookAt(target.position.offset(0, 1.0, 0), true);
    await bot.attack(target);
    await sleep(550);
    await bot.attack(target);
  }

  // Vacuum drops
  try { await lib.pickup(5); } catch (e) {}

  const currentRods = lib.count('blaze_rod');
  if (currentRods !== rods) {
    rods = currentRods;
    console.log(`>>> BLAZE ROD HARVESTED! Total: ${rods} <<<`);
    bot.chat(`delta: Harvested Blaze Rod! Total: ${rods}/8! HP: ${bot.health}/20`);
  }

  await sleep(350);
}

try { await lib.pickup(8); } catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log(`Assault session complete! Blaze Rods: ${finalRods}, HP: ${bot.health}/20`);
console.log('Delta inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

bot.chat(`delta: Pillbox harvest round complete! Blaze Rods: ${finalRods}, HP: ${bot.health}/20`);
