// programs/674-sprint-world-spawn-to-base.js
console.log('=== Program 674: Sprint from World Spawn to Base ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Swim up and sprint onto dry land (+x, +z)
bot.setControlState('jump', true);
bot.setControlState('forward', true);
bot.setControlState('sprint', true);
await bot.lookAt(new Vec3(bot.entity.position.x + 25, 64, bot.entity.position.z + 15), true);
await sleep(3500);
bot.clearControlStates();

console.log('On land pos:', lib.fmt(bot.entity.position));

// Setup fast sprinting pathfinder
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowSprinting = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

bot.chat('beta: Sprinting 270m across broad daylight back to Base shelter!');

const checkpoints = [
  new Vec3(100, 64, -140),
  new Vec3(150, 64, -110),
  new Vec3(200, 64, -80),
  new Vec3(250, 68, -60),
  new Vec3(272, 70, -75), // Oak clearing
  new Vec3(294, 72, -53)  // Base exterior door
];

for (let i = 0; i < checkpoints.length && !isCancelled(); i++) {
  const cp = checkpoints[i];
  console.log(`[CP ${i+1}/${checkpoints.length}] Sprinting towards ${cp}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNearXZ(cp.x, cp.z, 3.5));
    console.log(`Reached CP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`CP ${i+1} path note:`, e.message);
    try { await lib.goToXZ(cp.x, cp.z); } catch (e2) {}
  }
}

console.log('Arrived at base door exterior! Pos:', lib.fmt(bot.entity.position));

// Enter base door
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

// Permanently lock bed spawn
console.log('Locking spawn at base bed...');
try {
  await lib.setSpawn();
  console.log('SUCCESS: SPAWN POINT LOCKED AT BED!');
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
