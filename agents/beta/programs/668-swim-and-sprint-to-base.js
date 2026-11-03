// programs/668-swim-and-sprint-to-base.js
console.log('=== Program 668: Surface Swim & Sprint to Base ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Phase 1: Fast Surface Swim towards Shore at (220, 64, -90)
console.log('Phase 1: Surface swimming towards shore (220, 64, -90)...');
const shoreTarget = new Vec3(220, 64, -90);

bot.setControlState('jump', true);
bot.setControlState('sprint', true);
bot.setControlState('forward', true);

for (let s = 0; s < 25; s++) {
  await bot.lookAt(shoreTarget, true);
  await sleep(1000);
  console.log(`[Swim ${s+1}s] Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);
  // If we reached dry land or near shore
  if (bot.entity.position.x >= 210 && bot.entity.position.z >= -105) {
    console.log('Shore reached!');
    break;
  }
}
bot.clearControlStates();

console.log('Position after swim:', lib.fmt(bot.entity.position));

// Phase 2: Pathfinder Sprint to Base Door (294, 72, -53)
console.log('Phase 2: Sprinting to Base Door (294, 72, -53)...');
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowSprinting = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1.8));
  console.log('At base door exterior! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('GoalNear error, trying lib.goTo:', e.message);
  try { await lib.goTo(294, 72, -53, 1.8, { dig: false }); } catch (e2) {}
}

// Phase 3: Enter Base Shelter & Lock Bed Spawn
console.log('Phase 3: Entering base shelter...');
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

// Lock spawn point at bed
console.log('Locking spawn at base bed...');
try {
  await lib.setSpawn();
  console.log('SUCCESS: SPAWN POINT LOCKED AT BED!');
  bot.chat('beta: Back inside base shelter! Spawn point permanently locked at bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
  const beds = bot.findBlocks({ matching: b => b.name.includes('bed'), maxDistance: 6 });
  if (beds.length > 0) {
    const b = bot.blockAt(beds[0]);
    await bot.activateBlock(b);
    console.log('Activated bed at', beds[0]);
  }
}

return {
  pos: bot.entity.position,
  health: bot.health,
  food: bot.food,
  dimension: bot.game.dimension
};
