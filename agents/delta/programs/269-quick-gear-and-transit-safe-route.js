// programs/269-quick-gear-and-transit-safe-route.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(150);

// 1. Collect 2 more logs to have 3 total
console.log('Collecting logs near base...');
if (lib.count('*_log') < 3) {
  try {
    await lib.collect('*_log', 3 - lib.count('*_log'));
  } catch (e) {
    console.log('Log collect note:', e.message);
  }
}
console.log('Logs in inv:', lib.count('*_log'));

// 2. Craft wooden pickaxe
const logName = bot.inventory.items().find(i => i.name.endsWith('_log'))?.name || 'birch_log';
const plankName = logName.replace(/_log$/, '_planks');
await lib.craft(plankName, 8);
await lib.craft('stick', 4);
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe ready!');

// 3. Descend into mine shaft at (302, 71, -44)
console.log('Moving into mine shaft at (304, 60, -55)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(304, 60, -55, 2));
} catch (e) {
  console.log('Shaft goto note:', e.message);
}

// 4. Mine 5 stone, craft stone pickaxe and sword, quarry 12 cobblestone
console.log('Mining stone...');
while (lib.count('cobblestone') < 5 && !isCancelled()) {
  const s = bot.findBlocks({ matching: b => b.name === 'stone' || b.name === 'deepslate', maxDistance: 4, count: 5 })[0];
  if (!s) break;
  try {
    await lib.dig(s.x, s.y, s.z);
    await lib.pickup(3);
  } catch (e) {}
}

await lib.craft('stone_pickaxe', 1);
await lib.craft('stone_sword', 1);

// Quarry 12 cobble
while (lib.count('cobblestone') < 12 && !isCancelled()) {
  const s = bot.findBlocks({ matching: b => b.name === 'stone' || b.name === 'deepslate', maxDistance: 4, count: 5 })[0];
  if (!s) break;
  try {
    await lib.dig(s.x, s.y, s.z);
    await lib.pickup(3);
  } catch (e) {}
}
console.log('Gear ready! Inv:', JSON.stringify(lib.inv()));

// 5. Enter Nether portal at (298, 72, -54)
console.log('Ascending to Nether portal...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(298, 72, -54, 2));
} catch (e) {}

bot.chat(`delta: Armed with stone sword, pickaxe, and ${lib.count('cobblestone')} cobble! Stepping into Nether portal!`);

await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(800);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Inside portal frame. Waiting for dimension transition...');
const start = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  throw new Error('Failed to enter the_nether');
}

bot.chat(`delta: In Nether at ${lib.fmt(bot.entity.position)}! Sprinting strictly along z<=-7 safe route to frontline!`);

// 6. Strict Safe Route (z <= -7, bypassing soul fire hill completely)
const safeNetherWPs = [
  new Vec3(50, 65, -7),
  new Vec3(60, 65, -7),
  new Vec3(63, 65, -7),
  new Vec3(63, 65, -15),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -145),
  new Vec3(44, 65, -158) // Fortified frontline bunker
];

for (let i = 0; i < safeNetherWPs.length; i++) {
  if (isCancelled()) break;
  const wp = safeNetherWPs[i];
  console.log(`Advancing to Nether Safe WP ${i + 1}/${safeNetherWPs.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`Path note to ${lib.fmt(wp)}:`, e.message);
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 1, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(350);
    bot.setControlState('forward', false);
  }
}

console.log('Arrived at frontline! Pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: United at frontline ${lib.fmt(bot.entity.position)} with team! Ready to storm the Blaze Spawner!`);
