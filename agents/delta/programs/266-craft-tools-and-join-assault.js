// programs/266-craft-tools-and-join-assault.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(150);

// 1. Craft wooden pickaxe from logs in inventory
console.log('Crafting wooden pickaxe...');
await lib.craft('oak_planks', 8);
await lib.craft('stick', 4);
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe ready!');

// 2. Descend into mine shaft at (302, 71, -44)
console.log('Descending into main mine shaft for stone...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(302, 71, -44, 2));
} catch (e) {}

try {
  await bot.pathfinder.goto(new goals.GoalNear(304, 60, -55, 2));
} catch (e) {}

console.log('Pos in shaft:', lib.fmt(bot.entity.position));

// 3. Mine 5 stone and craft stone_pickaxe + stone_sword
console.log('Mining stone for stone tools...');
while (lib.count('cobblestone') < 5 && !isCancelled()) {
  const stones = bot.findBlocks({ matching: b => b.name === 'stone' || b.name === 'deepslate', maxDistance: 4, count: 6 });
  if (stones.length === 0) break;
  for (const p of stones) {
    if (lib.count('cobblestone') >= 5 || isCancelled()) break;
    try {
      await lib.dig(p.x, p.y, p.z);
    } catch (e) {}
  }
  await lib.pickup(3);
}

await lib.craft('stone_pickaxe', 1);
if (lib.count('stick') < 1) await lib.craft('stick', 4);
await lib.craft('stone_sword', 1);
console.log('Stone tools crafted! Inv:', JSON.stringify(lib.inv()));

// 4. Ascend and enter Nether portal
console.log('Ascending to Nether portal at (298, 72, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(298, 72, -54, 2));
} catch (e) {}

bot.chat('delta: Armed with stone sword & pickaxe! Stepping into Nether portal!');

await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(800);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Inside portal frame. Waiting for dimension shift...');
const start = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
  await sleep(500);
}

console.log('Current dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  throw new Error('Failed to enter the_nether');
}

bot.chat(`delta: In Nether at ${lib.fmt(bot.entity.position)}! Sprinting to frontline bunker at (44, 65, -158)!`);

// 5. Sprint through covered East Ridge tunnel to frontline
const waypoints = [
  new Vec3(50, 65, -6),
  new Vec3(63, 65, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -145),
  new Vec3(44, 65, -158) // Frontline bunker with Alpha (64 cobble) & Beta
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Heading to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
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
bot.chat(`delta: United at frontline bunker ${lib.fmt(bot.entity.position)} with Alpha & Beta! Let us bridge to the Spawner!`);
