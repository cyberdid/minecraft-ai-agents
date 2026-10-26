// programs/257-sprint-to-base-and-set-spawn.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(100);

bot.chat('delta: Sprinting East from world spawn to base camp at (294, 72, -55)!');

// 1. Waypoints across overworld to base
const waypoints = [
  new Vec3(150, 64, -30),
  new Vec3(200, 64, -40),
  new Vec3(250, 63, -50),
  new Vec3(290, 72, -54)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Heading to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 4));
  } catch (e) {
    console.log(`Path note to ${lib.fmt(wp)}:`, e.message);
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(2000);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
  }
}

console.log('Arrived outside base at:', lib.fmt(bot.entity.position));

// 2. Step inside base through door at (294, 72, -54)
console.log('Entering base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door passage attempt:', e.message);
}

// 3. Set spawn at bed
console.log('Locking spawn at base bed...');
try {
  const result = await lib.setSpawn();
  console.log('Spawn set result:', result);
  bot.chat('delta: Spawn permanently locked at base bed! Never returning to world spawn.');
} catch (e) {
  console.log('Set spawn note:', e.message);
}

console.log('Delta pos inside base:', lib.fmt(bot.entity.position));
