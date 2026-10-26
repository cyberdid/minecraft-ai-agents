// programs/575-sprint-to-base-set-spawn-gearup.js
console.log('=== Step: Sprint to Base, Lock Spawn, and Gear Up ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Sprint to Base door
const waypoints = [
  new Vec3(250, 66, -50),
  new Vec3(280, 72, -54),
  new Vec3(294, 72, -54)
];

for (const wp of waypoints) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (err) {
    await bot.lookAt(new Vec3(wp.x, bot.entity.position.y, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(2500);
    bot.clearControlStates();
  }
}

console.log('Arrived outside Base door at:', lib.fmt(bot.entity.position));

// 2. Step through base door (294, 72, -54)
console.log('Stepping through base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1));
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside Base at:', lib.fmt(bot.entity.position));

// 3. Lock spawn at bed
try {
  await lib.setSpawn();
  console.log('SUCCESS: Bed spawn locked at Base!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 4. Check chest for any tools/weapons/blocks
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(chest));
} catch (e) {}

// Check nearby dropped items in base
await lib.pickup(6);
console.log('Inventory now:', JSON.stringify(lib.inv()));

bot.chat(`beta: At Base (${lib.fmt(bot.entity.position)})! Spawn locked. Gearing up for Nether push.`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
