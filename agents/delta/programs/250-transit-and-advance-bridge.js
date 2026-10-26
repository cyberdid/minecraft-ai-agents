// programs/250-transit-and-advance-bridge.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Cobble in inv:', lib.count('cobblestone'));

bot.pathfinder.stop();
await sleep(100);

// 1. Step into Nether portal if in overworld
if (bot.game.dimension !== 'the_nether') {
  console.log('Stepping into Nether portal block at (299.5, 73.0, -54.0)...');
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('jump', true);
  bot.setControlState('forward', true);
  await sleep(800);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  console.log('Standing still inside portal. Waiting for dimension shift...');
  const start = Date.now();
  while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
    await sleep(500);
  }
}

console.log('Current dim:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  throw new Error('Failed to enter the_nether');
}

bot.chat(`delta: In Nether at ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & stone swords! Sprinting through covered tunnel!`);

// 2. Sprint through fully enclosed East Ridge tunnel to mountain cover
const waypoints = [
  new Vec3(50, 65, -6),
  new Vec3(63, 65, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -161) // Stop safely inside mountain rock!
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Heading to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`WP note to ${lib.fmt(wp)}:`, e.message);
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 1, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(350);
    bot.setControlState('forward', false);
  }
}

console.log('Arrived inside mountain cover at:', lib.fmt(bot.entity.position));
bot.chat(`delta: Stationed safely inside mountain cover at ${lib.fmt(bot.entity.position)}! Inspecting corridor ahead...`);

// 3. Scan corridor from z=-161 to z=-176
console.log('--- CORRIDOR ENVELOPE SCAN (z=-161 to -176) ---');
for (let z = -161; z >= -176; z--) {
  const f = bot.blockAt(new Vec3(44, 64, z))?.name || 'none';
  const w1 = bot.blockAt(new Vec3(43, 65, z))?.name || 'none';
  const w2 = bot.blockAt(new Vec3(43, 66, z))?.name || 'none';
  const r = bot.blockAt(new Vec3(44, 67, z))?.name || 'none';
  console.log(`z=${z}: floor(44,64)=${f} west_y65=${w1} west_y66=${w2} roof=${r}`);
}

// Check distance to spawner
const spawner = new Vec3(32, 68, -190);
console.log(`Distance to Spawner: ${bot.entity.position.distanceTo(spawner).toFixed(1)}m`);
