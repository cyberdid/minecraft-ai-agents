// programs/478-sprint-to-base.js
console.log('=== SPRINT TO OVERWORLD BASE IN 25M STAGES ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('gamma: Sprinting to Base across surface in 25m waypoints...');

// 1. Configure surface movement
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
moves.maxDropDown = 4;
bot.pathfinder.setMovements(moves);

// 2. Intermediate waypoints from spawn to base
const WAYPOINTS = [
  { x: 145, z: -20 },
  { x: 175, z: -25 },
  { x: 205, z: -32 },
  { x: 235, z: -40 },
  { x: 265, z: -48 },
  { x: 285, z: -52 },
  { x: 294, z: -52.5 }
];

for (let i = 0; i < WAYPOINTS.length && !isCancelled(); i++) {
  const wp = WAYPOINTS[i];
  console.log(`[Stage ${i + 1}/${WAYPOINTS.length}] -> (${wp.x}, ${wp.z}) current pos:`, lib.fmt(bot.entity.position));
  try {
    await bot.pathfinder.goto(new goals.GoalNearXZ(wp.x, wp.z, 2.5));
  } catch (e) {
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 12000 });
    } catch (e2) {
      console.log(`Stage ${i + 1} fallback:`, e2.message);
    }
  }
}

console.log('Outside base! Current pos:', lib.fmt(bot.entity.position));

// 3. Open door and enter base house
try {
  await lib.door(294, 72, -54, true);
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -55.5, 0.5));
  await lib.door(294, 72, -54, false);
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Inside base! Current pos:', lib.fmt(bot.entity.position));

// 4. Set spawn on bed
try {
  await lib.setSpawn();
  bot.chat('gamma: Spawn safely locked at Base Bed!');
  console.log('Spawn set successfully!');
} catch (e) {
  console.log('setSpawn warning:', e.message);
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
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
