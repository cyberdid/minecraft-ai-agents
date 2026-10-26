// programs/270-craft-sword-and-transit-safe-route.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));

bot.pathfinder.stop();
await sleep(150);

// 1. Craft sticks and stone sword
console.log('Crafting sticks...');
if (lib.count('stick') < 1) {
  await lib.craft('stick', 4);
}
console.log('Crafting stone sword...');
if (lib.count('stone_sword') < 1) {
  await lib.craft('stone_sword', 1);
}
console.log('Stone sword ready! Inv:', JSON.stringify(lib.inv()));

// 2. Walk to Nether portal at (298, 72, -54)
console.log('Moving to Nether portal at (298, 72, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(298, 72, -54, 2));
} catch (e) {
  await lib.goTo(298, 72, -54, 2);
}

bot.chat(`delta: Armed with stone sword & pickaxe! Stepping into Nether portal!`);

// Step into portal
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

// 3. Strict Safe Route (z <= -7, bypassing soul fire hill completely)
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
  new Vec3(44, 65, -158),
  new Vec3(44, 65, -170) // Spawner frontline corridor
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
bot.chat(`delta: United at frontline ${lib.fmt(bot.entity.position)} with Alpha & Beta! Let us take the Blaze Spawner!`);
