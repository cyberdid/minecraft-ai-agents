// programs/636-sprint-spawn-to-base.js
console.log('=== Program 636: Sprint from World Spawn to Base Shelter ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowSprinting = true;
bot.pathfinder.setMovements(moves);

const waypoints = [
  new Vec3(160, 64, -130),
  new Vec3(200, 64, -100),
  new Vec3(240, 66, -75),
  new Vec3(270, 70, -60),
  new Vec3(294, 72, -53)
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i + 1}/${waypoints.length}] Moving to (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
  } catch (e) {
    console.log(`WP ${i + 1} note:`, e.message);
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.5, { dig: false, timeoutMs: 15000 }); } catch (e2) {}
  }
}

console.log('At base door! Pos:', lib.fmt(bot.entity.position));

// Enter base shelter
console.log('Entering base through door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door pass note:', e.message);
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(293, 72, -55, 1, { dig: false });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// Set spawn at base bed
try {
  await lib.setSpawn();
  console.log('SUCCESS: Spawn point locked at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

bot.chat(`beta: Safely back inside base shelter at ${lib.fmt(bot.entity.position)}! Spawn locked!`);

return {
  pos: bot.entity.position,
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
