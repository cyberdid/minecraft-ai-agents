// programs/520-sprint-to-base-and-lock-spawn.js
console.log('=== Program 520: Sprint to Base Camp & Permanently Lock Spawn ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Time until night:', lib.time().secondsUntilNight);

bot.pathfinder.stop();
await sleep(100);

bot.chat('alpha: Sprinting East from world spawn to base camp at (294, 72, -55)!');

// 1. Waypoints across Overworld from world spawn to base camp
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
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
  } catch (e) {
    console.log(`Path note to ${lib.fmt(wp)}: ${e.message}`);
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
  await passDoorIn();
} catch (e) {
  console.log('passDoorIn attempt:', e.message);
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (err) {
    console.log('goThroughDoor attempt:', err.message);
  }
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Set spawn permanently at base bed
console.log('Locking spawn at base bed...');
try {
  const result = await lib.setSpawn();
  console.log('Spawn set result:', result);
  bot.chat('alpha: Spawn permanently locked at base bed! Never returning to world spawn.');
} catch (err) {
  console.log('Set spawn note:', err.message);
}

// 4. If night arrives, sleep in bed to skip night
if (lib.time().canSleep) {
  console.log('Sleeping in bed...');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (err) {
    console.log('Sleep note:', err.message);
  }
}

console.log('=== Final Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
