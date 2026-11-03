// programs/479-sprint-into-base-and-sleep.js
console.log('=== GAMMA: SPRINT INTO BASE HOUSE & SLEEP ===');
console.log('Current pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.chat('gamma: Sprinting final 68m into base house before night!');

// 1. Configure fast surface movement
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
moves.maxDropDown = 4;
bot.pathfinder.setMovements(moves);

// 2. Sprint waypoints to base
const WAYPOINTS = [
  { x: 255, z: -44 },
  { x: 280, z: -50 },
  { x: 294, z: -52.5 }
];

for (let i = 0; i < WAYPOINTS.length && !isCancelled(); i++) {
  const wp = WAYPOINTS[i];
  console.log(`[Stage ${i + 1}/${WAYPOINTS.length}] -> (${wp.x}, ${wp.z}) pos:`, lib.fmt(bot.entity.position));
  try {
    await bot.pathfinder.goto(new goals.GoalNearXZ(wp.x, wp.z, 2.0));
  } catch (e) {
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 8000 });
    } catch (e2) {}
  }
}

console.log('Outside base door! Pos:', lib.fmt(bot.entity.position));

// 3. Open south door at (294, 72, -54) and enter
try {
  await lib.door(294, 72, -54, true);
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -55.5, 0.4));
  await lib.door(294, 72, -54, false);
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Safely inside base house! Pos:', lib.fmt(bot.entity.position));

// 4. Set spawn and sleep
try {
  await lib.setSpawn();
  bot.chat('gamma: Spawn permanently locked at Base Bed 1!');
} catch (e) {
  console.log('setSpawn:', e.message);
}

// Check time of day to sleep
console.log('Time of day:', bot.time.timeOfDay);
if (bot.time.timeOfDay >= 12542 || bot.time.timeOfDay <= 500) {
  console.log('Night time! Sleeping in bed to skip night...');
  try {
    await lib.sleep();
    bot.chat('gamma: Slept in bed! Night skipped!');
  } catch (e) {
    console.log('Sleep notice:', e.message);
  }
}

// 5. Inspect Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  const chest = await bot.openContainer(chestBlock);
  console.log('--- BASE CHEST CONTENTS ---');
  for (const item of chest.containerItems()) {
    console.log(`- ${item.name} x${item.count}`);
  }
  chest.close();
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay,
  inv: lib.inv()
};
