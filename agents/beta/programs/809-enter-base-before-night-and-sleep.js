// programs/809-enter-base-before-night-and-sleep.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 809: Enter Base Before Night & Sleep ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

bot.chat('Beta: Sprinting to Base (293, 72, -55) before nightfall in 80s to sleep!');

const waypoints = [
  new Vec3(180, 64, -100),
  new Vec3(220, 66, -80),
  new Vec3(260, 70, -60),
  new Vec3(290, 72, -54),
  new Vec3(294, 72, -54)
];

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(wp) < 3.0) continue;
  console.log(`Running to waypoint ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2.5, { timeoutMs: 10000 });
    } catch (e2) {}
  }
}

// Enter through base door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(294, 72, -55, 1.2); } catch (e2) {}
}

// Close door for night safety
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// Set spawn
try {
  await lib.setSpawn();
  console.log('Spawn point permanently set at base bed.');
} catch (e) {}

// Wait for night and sleep
console.log('Current time:', bot.time.timeOfDay, 'Waiting for tick 12542...');
const waitStart = Date.now();
while (!lib.time().canSleep && Date.now() - waitStart < 40000 && !isCancelled()) {
  await sleep(1000);
}

if (lib.time().canSleep) {
  console.log('Sleeping in bed...');
  bot.chat('Beta: Sleeping in base bed now! Team, sleep to skip night!');
  try {
    await lib.sleepInBed();
    await sleep(4000);
  } catch (e) {
    console.log('Sleep notice:', e.message);
  }
}

// Wake if sleeping
try { await bot.wake(); } catch (e) {}

console.log('=== Post-Night Status ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time:', bot.time.timeOfDay);
console.log('HP:', bot.health, 'Food:', bot.food);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay
};
