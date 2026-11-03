// programs/665-swim-to-shore-and-sprint-base.js
console.log('=== Program 665: Swim to Shore & Sprint to Base ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Swim up and move East towards dry land (+x, +z)
bot.setControlState('jump', true);
bot.setControlState('forward', true);
bot.setControlState('sprint', true);
await bot.lookAt(new Vec3(bot.entity.position.x + 20, 65, bot.entity.position.z + 20), true);
await sleep(4000);
bot.clearControlStates();

console.log('Position after swim:', lib.fmt(bot.entity.position));

// Setup pathfinder to sprint towards base (294, 72, -54)
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowSprinting = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

const waypoints = [
  new Vec3(220, 64, -110),
  new Vec3(260, 68, -75),
  new Vec3(290, 72, -54),
  new Vec3(294, 72, -53)
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`Advancing to ${wp}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNearXZ(wp.x, wp.z, 3));
    console.log(`Reached near ${wp}: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Path error to ${wp}:`, e.message);
    try { await lib.goToXZ(wp.x, wp.z); } catch (e2) {}
  }
}

// Enter base shelter
console.log('Entering base shelter through door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(293, 72, -55, 1, { dig: false });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside base shelter! Pos:', lib.fmt(bot.entity.position));

// Set spawn point
console.log('Setting spawn at base bed...');
try {
  await lib.setSpawn();
  console.log('SPAWN POINT LOCKED AT BED!');
  bot.chat('beta: Safely inside base! Spawn point locked at bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
  const beds = bot.findBlocks({ matching: b => b.name.includes('bed'), maxDistance: 6 });
  if (beds.length > 0) {
    const b = bot.blockAt(beds[0]);
    await bot.activateBlock(b);
  }
}

// If night has fallen or canSleep, sleep in bed
const t = lib.time();
if (t.canSleep || t.secondsUntilNight < 30) {
  console.log('Night reached! Sleeping in bed...');
  try { await lib.sleepInBed(); } catch (e) {}
}

return {
  pos: bot.entity.position,
  health: bot.health,
  food: bot.food,
  dimension: bot.game.dimension
};
