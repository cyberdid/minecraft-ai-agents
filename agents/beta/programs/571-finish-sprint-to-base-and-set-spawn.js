// programs/571-finish-sprint-to-base-and-set-spawn.js
console.log('=== Step: Finish Sprint to Base & Set Bed Spawn ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Sprint to Base door
const waypoints = [
  new Vec3(265, 66, -52),
  new Vec3(285, 72, -54),
  new Vec3(294, 72, -54)
];

for (const wp of waypoints) {
  if (isCancelled()) break;
  console.log(`Advancing to ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (err) {
    console.log(`Path note, direct sprint to ${lib.fmt(wp)}:`, err.message);
    await bot.lookAt(new Vec3(wp.x, bot.entity.position.y, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(2500);
    bot.clearControlStates();
  }
}

console.log('Arrived outside Base door at:', lib.fmt(bot.entity.position));

// Step through base door
console.log('Stepping through base door (294, 72, -54)...');
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

console.log('Inside Base at:', lib.fmt(bot.entity.position));

// Set spawn at bed
try {
  await lib.setSpawn();
  console.log('SUCCESS: Spawn set at Base bed!');
  bot.chat(`beta: Inside Base at (${lib.fmt(bot.entity.position)})! Spawn locked at bed. Re-arming for Nether assault!`);
} catch (e) {
  console.log('setSpawn note:', e.message);
}

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
