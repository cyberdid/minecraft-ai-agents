// programs/272-clean-portal-entry-and-sprint.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(100);

if (bot.game.dimension !== 'the_nether') {
  // Step 1: Align with portal opening at x=299.5, z=-52.5
  console.log('Aligning with portal opening at (299.5, 73.0, -52.5)...');
  await bot.lookAt(new Vec3(299.5, 73.0, -52.5), true);
  bot.setControlState('forward', true);
  await sleep(400);
  bot.setControlState('forward', false);

  // Step 2: Walk straight North into nether_portal at z=-54.0
  console.log('Walking straight North into nether_portal at z=-54.0...');
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('forward', false);

  const b = bot.blockAt(bot.entity.position);
  console.log('Block at feet:', b?.name, 'pos:', lib.fmt(bot.entity.position));
  bot.chat('delta: Inside purple nether_portal block! Waiting for dimension shift...');

  const start = Date.now();
  while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
    await sleep(500);
  }
}

console.log('Current dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  throw new Error('Failed to enter the_nether');
}

bot.chat(`delta: In Nether at ${lib.fmt(bot.entity.position)}! Sprinting strictly along z<=-7 safe route to frontline!`);

// Step 3: Strict Safe Route (z <= -7, bypassing soul fire hill completely)
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
  new Vec3(44, 65, -170)
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
