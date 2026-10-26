// programs/258-finish-sprint-and-lock-spawn.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(100);

bot.chat('delta: Completing sprint to base shelter at (294, 72, -54)...');

// 1. Sprint directly to base outside door
const waypoints = [
  new Vec3(220, 64, -45),
  new Vec3(260, 64, -50),
  new Vec3(292, 72, -54)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Heading to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
  } catch (e) {
    console.log(`Path note to ${lib.fmt(wp)}:`, e.message);
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(2500);
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
  console.log('Door passage attempt 1:', e.message);
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 1));
  await lib.goThroughDoor(294, 72, -54);
}

// 3. Set spawn at bed
console.log('Setting spawn at base bed...');
try {
  const result = await lib.setSpawn();
  console.log('Spawn set result:', result);
  bot.chat('delta: Spawn permanently locked at base bed! Never returning to world spawn.');
} catch (e) {
  console.log('Set spawn note:', e.message);
}

console.log('Delta pos inside base:', lib.fmt(bot.entity.position));
