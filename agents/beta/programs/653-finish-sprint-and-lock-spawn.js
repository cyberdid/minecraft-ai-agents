// programs/653-finish-sprint-and-lock-spawn.js
console.log('=== Program 653: Finish Sprint to Base & Lock Spawn ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowSprinting = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

console.log('Sprinting remaining 70m to base at (294, 72, -53)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1.5));
} catch (e) {
  console.log('GoalNear error, trying lib.goTo:', e.message);
  try {
    await lib.goTo(294, 72, -53, 2, { dig: false });
  } catch (e2) {}
}

console.log('At base door! Pos:', lib.fmt(bot.entity.position));

// Enter base door
console.log('Entering base shelter through door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor note:', e.message);
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(293, 72, -55, 1, { dig: false });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside base shelter! Pos:', lib.fmt(bot.entity.position));

// Lock spawn point at Bed
console.log('Setting spawn at base bed...');
try {
  await lib.setSpawn();
  console.log('SPAWN POINT LOCKED AT BED!');
  bot.chat('beta: Safely back inside base! Spawn point locked at bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
  const beds = bot.findBlocks({ matching: b => b.name.includes('bed'), maxDistance: 5 });
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
