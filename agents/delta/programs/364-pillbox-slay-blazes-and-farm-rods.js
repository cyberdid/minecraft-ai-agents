// programs/364-pillbox-slay-blazes-and-farm-rods.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Equip stone sword in main hand
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) {
  await bot.equip(sword, 'hand');
  console.log('Equipped sword:', sword.name);
}

// 2. Continuous stationary combat loop
const startTime = Date.now();
let rods = lib.count('blaze_rod');
console.log(`Starting pillbox combat session! Initial Blaze Rods: ${rods}`);

bot.chat(`delta: Slaying Blazes from Spawner Pillbox! Rods: ${rods}/8, HP: ${bot.health}/20`);

while (!isCancelled() && (Date.now() - startTime < 60000) && bot.health > 5) {
  // Ensure sword equipped
  const currentSword = bot.inventory.items().find(i => i.name.includes('sword'));
  if (currentSword && bot.entity.heldItem?.name !== currentSword.name) {
    try { await bot.equip(currentSword, 'hand'); } catch (e) {}
  }

  // Find nearest Blaze in strike range
  const blazes = Object.values(bot.entities)
    .filter(e => e && e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) <= 5.5)
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  if (blazes.length > 0) {
    const target = blazes[0];
    const dist = bot.entity.position.distanceTo(target.position);
    console.log(`Striking Blaze at ${lib.fmt(target.position)} (dist: ${dist.toFixed(1)}m, HP: ${bot.health})...`);
    await bot.lookAt(target.position.offset(0, 1.0, 0), true);
    await bot.attack(target);
    await sleep(550);
    await bot.attack(target);
  } else {
    // Scan slightly wider if none within 5.5m
    const nearby = Object.values(bot.entities).filter(e => e && e.name === 'blaze' && bot.entity.position.distanceTo(e.position) <= 8.0);
    if (nearby.length > 0) {
      console.log(`Blazes visible (${nearby.length}) just outside reach, awaiting approach...`);
      await bot.lookAt(nearby[0].position.offset(0, 1.0, 0), true);
    }
    await sleep(400);
  }

  // Vacuum up drops (Blaze rods, etc.) without moving feet off position
  try {
    const p = await lib.pickup(5);
    if (p > 0) console.log(`Picked up ${p} items!`);
  } catch (e) {}

  const currentRods = lib.count('blaze_rod');
  if (currentRods !== rods) {
    rods = currentRods;
    console.log(`>>> BLAZE ROD HARVESTED! Total: ${rods} <<<`);
    bot.chat(`delta: Harvested Blaze Rod! Total: ${rods}/8! HP: ${bot.health}/20`);
  }

  await sleep(350);
}

// Final pickup
try { await lib.pickup(8); } catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log(`Pillbox session complete! Blaze Rods in inventory: ${finalRods}, HP: ${bot.health}/20`);
console.log('Current inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

bot.chat(`delta: Pillbox combat round finished! Blaze Rods: ${finalRods}, HP: ${bot.health}/20`);
