// programs/678-finish-sprint-to-base.js
console.log('=== Program 678: Finish Sprint to Base & Lock Bed Spawn ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowSprinting = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

bot.chat('beta: Sprinting last 140m across plains to Base shelter!');

const checkpoints = [
  new Vec3(200, 64, -80),
  new Vec3(250, 68, -65),
  new Vec3(272, 70, -75), // Oak clearing
  new Vec3(294, 72, -53)  // Base door exterior
];

for (let i = 0; i < checkpoints.length && !isCancelled(); i++) {
  const cp = checkpoints[i];
  console.log(`[CP ${i+1}/${checkpoints.length}] Moving to ${cp}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(cp.x, cp.y, cp.z, 2.5));
    console.log(`Arrived near CP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`CP ${i+1} note:`, e.message);
    try { await lib.goToXZ(cp.x, cp.z); } catch (e2) {}
  }
}

console.log('At base door exterior! Pos:', lib.fmt(bot.entity.position));

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

// Lock spawn point at base bed
console.log('Locking spawn at base bed...');
try {
  await lib.setSpawn();
  console.log('SUCCESS: SPAWN POINT LOCKED AT BED!');
  bot.chat('beta: Safely inside base shelter! Spawn point permanently locked at bed!');
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
