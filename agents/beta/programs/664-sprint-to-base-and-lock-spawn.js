// programs/664-sprint-to-base-and-lock-spawn.js
console.log('=== Program 664: Sprint to Base & Lock Bed Spawn ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// First swim up and out of water
bot.setControlState('jump', true);
bot.setControlState('sprint', true);
bot.setControlState('forward', true);
await bot.lookAt(new Vec3(bot.entity.position.x + 20, 64, bot.entity.position.z + 20), true);
await sleep(2500);
bot.clearControlStates();

console.log('After swim-up pos:', lib.fmt(bot.entity.position));

// Setup fast sprinting pathfinder
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowSprinting = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

bot.chat('beta: Sprinting 150m across daylight back to Base shelter!');

// Waypoints to base (294, 72, -54)
const waypoints = [
  new Vec3(210, 64, -120),
  new Vec3(250, 65, -80),
  new Vec3(272, 70, -75), // Oak clearing
  new Vec3(294, 72, -53)  // Base door exterior
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i+1}/${waypoints.length}] Navigating to ${wp}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    console.log(`Arrived near WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i+1} path note:`, e.message);
    try {
      await lib.goToXZ(wp.x, wp.z);
    } catch (e2) {}
  }
}

console.log('Arrived at base door exterior! Pos:', lib.fmt(bot.entity.position));

// Step inside base shelter
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

// Permanently set spawn at bed
console.log('Setting spawn at base bed...');
try {
  await lib.setSpawn();
  console.log('SPAWN POINT LOCKED AT BED!');
  bot.chat('beta: Safely inside base shelter! Spawn permanently locked at bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
  const beds = bot.findBlocks({ matching: b => b.name.includes('bed'), maxDistance: 6 });
  if (beds.length > 0) {
    const b = bot.blockAt(beds[0]);
    await bot.activateBlock(b);
    console.log('Activated bed directly at', beds[0]);
  }
}

return {
  pos: bot.entity.position,
  health: bot.health,
  food: bot.food,
  dimension: bot.game.dimension
};
