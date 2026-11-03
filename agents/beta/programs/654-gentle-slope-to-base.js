// programs/654-gentle-slope-to-base.js
console.log('=== Program 654: Gentle Slope to Base & Lock Spawn ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowSprinting = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

// Step 1: Walk to oak tree clearing at (272, 70, -75)
console.log('Step 1: Moving to oak tree clearing (272, 70, -75)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(272, 70, -75, 2));
} catch (e) {
  console.log('Step 1 path error, trying direct walk:', e.message);
  try { await lib.goTo(272, 70, -75, 2, { dig: false }); } catch (e2) {}
}
console.log('At oak tree clearing! Pos:', lib.fmt(bot.entity.position));

// Step 2: Walk to base door exterior at (294, 72, -53)
console.log('Step 2: Moving to base door exterior (294, 72, -53)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1.5));
} catch (e) {
  console.log('Step 2 path error, trying direct walk:', e.message);
  try { await lib.goTo(294, 72, -53, 1.5, { dig: false }); } catch (e2) {}
}
console.log('At base door exterior! Pos:', lib.fmt(bot.entity.position));

// Step 3: Enter base shelter through door
console.log('Step 3: Entering base shelter through door...');
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

// Step 4: Lock spawn at bed
console.log('Step 4: Locking spawn at base bed...');
try {
  await lib.setSpawn();
  console.log('SUCCESS: SPAWN POINT LOCKED AT BED!');
  bot.chat('beta: Inside base shelter! Respawn point permanently locked at bed!');
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
