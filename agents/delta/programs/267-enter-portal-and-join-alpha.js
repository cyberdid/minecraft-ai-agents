// programs/267-enter-portal-and-join-alpha.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Inv:', JSON.stringify(lib.inv()));

bot.pathfinder.stop();
await sleep(100);

// 1. Walk into nether portal block at (299.5, 73.0, -54.0)
if (bot.game.dimension !== 'the_nether') {
  console.log('Walking into portal at (299.5, 73.0, -54.0)...');
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(700);
  bot.setControlState('forward', false);
  
  // Verify standing in portal or right at it
  const currentBlock = bot.blockAt(bot.entity.position);
  console.log('Current block at feet:', currentBlock?.name, 'pos:', lib.fmt(bot.entity.position));
  
  // If not yet in nether_portal, nudge towards (299.5, 73.0, -54.0)
  if (currentBlock?.name !== 'nether_portal') {
    await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
  }

  console.log('Inside portal frame! Waiting for dimension change...');
  bot.chat('delta: Inside Nether portal frame! Transiting to Nether...');

  const start = Date.now();
  while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 20000)) {
    await sleep(500);
  }
}

console.log('Current dim:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  throw new Error('Failed to transit into the_nether');
}

bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}! Sprinting through covered tunnel to join Alpha!`);

// 2. Sprint through fully enclosed East Ridge tunnel to frontline
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
  new Vec3(44, 65, -158) // Fortified frontline bunker
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
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

// 3. Check players nearby
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist: ${d.toFixed(1)}m)`);
  }
}

bot.chat(`delta: United at frontline bunker ${lib.fmt(bot.entity.position)} with Alpha & Beta! Let us bridge to the Spawner Balcony!`);
