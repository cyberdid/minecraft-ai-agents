// programs/263-step-into-nether-portal-clean.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.pathfinder.stop();
await sleep(100);

// 1. Step to center of portal block (299.5, 73.0, -54.0)
if (bot.game.dimension !== 'the_nether') {
  console.log('Centering exactly inside portal block at (299.5, 73.0, -54.0)...');
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(400);
  bot.setControlState('forward', false);
  bot.clearControlStates();
  
  console.log('Centered at:', lib.fmt(bot.entity.position));
  console.log('Standing completely still to allow portal timer to complete...');
  
  const start = Date.now();
  while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 25000)) {
    await sleep(500);
  }
}

console.log('Current dim:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  throw new Error('Failed to enter the_nether');
}

bot.chat(`delta: In Nether at ${lib.fmt(bot.entity.position)} with 2 stone swords & ${lib.count('cobblestone')} cobble! Sprinting through covered tunnel!`);

// 2. Sprint through fully enclosed East Ridge tunnel
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
  new Vec3(44, 65, -158)
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

console.log('Reached frontline at:', lib.fmt(bot.entity.position));
bot.chat(`delta: Stationed at frontline ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & stone swords! Ready to bridge to Spawner Balcony!`);
