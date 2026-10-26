// programs/570-sprint-spawn-to-base-and-sleep.js
console.log('=== Step: Sprint from World Spawn to Base Shelter & Sleep ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

const waypoints = [
  new Vec3(190, 65, -40),
  new Vec3(240, 68, -50),
  new Vec3(285, 72, -54)
];

for (const wp of waypoints) {
  if (isCancelled()) break;
  console.log(`Running to WP ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
  } catch (err) {
    console.log(`Path note, sprinting direct towards ${lib.fmt(wp)}:`, err.message);
    await bot.lookAt(new Vec3(wp.x, bot.entity.position.y, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(3500);
    bot.clearControlStates();
  }
}

console.log('Near Base door at:', lib.fmt(bot.entity.position));

// Enter base door
console.log('Entering base door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor note:', e.message);
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1));
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// Set spawn at bed
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// Sleep if night / dusk
const timeInfo = lib.time();
console.log('Time info:', JSON.stringify(timeInfo));
if (timeInfo.canSleep || timeInfo.secondsUntilNight <= 0) {
  console.log('Attempting to sleep in bed...');
  try {
    await lib.sleepInBed();
    console.log('Sleeping in bed!');
  } catch (e) {
    console.log('sleepInBed note:', e.message);
  }
}

bot.chat(`beta: Safely inside Base shelter (${lib.fmt(bot.entity.position)})! Spawn set.`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  time: lib.time()
};
