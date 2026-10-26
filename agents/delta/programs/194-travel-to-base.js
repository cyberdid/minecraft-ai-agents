// programs/194-travel-to-base.js
console.log('Delta pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Time:', JSON.stringify(lib.time()));

// Stop any residual pathfinder goals
bot.pathfinder.stop();
await sleep(200);

const waypoints = [
  new Vec3(120, 64, -75),
  new Vec3(180, 65, -68),
  new Vec3(240, 68, -60),
  new Vec3(290, 72, -54)
];

bot.chat('delta: Running to Base Camp via 50m waypoints...');

for (const wp of waypoints) {
  if (isCancelled()) break;
  console.log(`Running to waypoint ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
    console.log(`Reached ${lib.fmt(wp)}! Current pos: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Path note at ${lib.fmt(wp)}:`, err.message);
    // Try simple walk towards waypoint
    await bot.lookAt(new Vec3(wp.x, bot.entity.position.y, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(4000);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
    bot.setControlState('jump', false);
  }
}

console.log('Near base pos:', lib.fmt(bot.entity.position));

// Enter base shelter
const doorPos = new Vec3(294, 73, -54);
const doorBlock = bot.blockAt(doorPos) || bot.blockAt(new Vec3(294, 72, -54));
if (doorBlock && doorBlock.name.includes('door')) {
  console.log('Found door, entering base shelter...');
  try {
    await lib.goThroughDoor(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z);
  } catch (e) {
    console.log('goThroughDoor error:', e.message);
    await lib.goTo(293, 72, -55, 1);
  }
} else {
  console.log('Walking into base at (293, 72, -55)...');
  try {
    await lib.goTo(293, 72, -55, 1);
  } catch (e) {
    console.log('goTo base error:', e.message);
  }
}

console.log('Inside base pos:', lib.fmt(bot.entity.position));

// Set spawn point at bed
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
  bot.chat('delta: Arrived at base! Bed spawn set.');
} catch (err) {
  console.log('setSpawn notice:', err.message);
}

// Sleep if night
if (lib.time().canSleep) {
  console.log('Night reached, sleeping in bed...');
  try {
    await lib.sleepInBed();
    console.log('Night skipped!');
    bot.chat('delta: Night skipped to morning!');
  } catch (err) {
    console.log('Sleep notice:', err.message);
  }
}

console.log('Final status:', JSON.stringify(lib.status()));
