// programs/798-sprint-back-to-base-and-sleep.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 798: Sprint Back to Base & Sleep ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

bot.chat('Beta: Sprinting straight North back to base so we can all sleep and reset to 20/20 HP and 20/20 Food!');

// Configure fast overland sprinting
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

const waypoints = [
  new Vec3(293, 72, 90),
  new Vec3(293, 72, 40),
  new Vec3(293, 72, -10),
  new Vec3(293, 72, -50),
  new Vec3(294, 72, -54)
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(wp) < 3.5) continue;
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

console.log('Inside base room at:', lib.fmt(bot.entity.position));

// Lock spawn
try {
  await lib.setSpawn();
  console.log('Spawn point confirmed at base bed.');
} catch (e) {}

// Wait for night and sleep
console.log('Checking time for sleep: time =', bot.time.timeOfDay, 'canSleep =', lib.time().canSleep);
const waitStart = Date.now();
while (!lib.time().canSleep && Date.now() - waitStart < 40000 && !isCancelled()) {
  await sleep(1000);
}

if (lib.time().canSleep) {
  console.log('Night has arrived! Sleeping in bed to skip night and reset HP/Food...');
  bot.chat('Beta: In bed sleeping! Team, sleep now to reset to full HP & Food!');
  try {
    await lib.sleepInBed();
    await sleep(4000);
  } catch (e) {
    console.log('Sleep warning:', e.message);
  }
}

// Check status after waking or waiting
console.log('=== Program 798 Status ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Time:', bot.time.timeOfDay);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay
};
