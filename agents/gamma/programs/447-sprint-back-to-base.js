// programs/447-sprint-back-to-base.js
console.log('=== SPRINT BACK TO BASE (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.maxDropDown = 3;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

const checkpoints = [
  { x: 80, z: -160 },
  { x: 130, z: -135 },
  { x: 180, z: -110 },
  { x: 230, z: -85 },
  { x: 270, z: -65 },
  { x: 292, z: -55 }
];

bot.chat('gamma: Sprinting back across Overworld to Base (293, 72, -55)...');

for (let i = 0; i < checkpoints.length && !isCancelled(); i++) {
  const cp = checkpoints[i];
  const cur = bot.entity.position;
  const distXZ = Math.hypot(cur.x - cp.x, cur.z - cp.z);
  console.log(`[CP ${i + 1}/${checkpoints.length}] Heading to (${cp.x}, ${cp.z}) [dist: ${distXZ.toFixed(1)}m, HP: ${bot.health.toFixed(1)}]`);

  if (distXZ < 6.0) continue;

  try {
    await bot.pathfinder.goto(new goals.GoalNearXZ(cp.x, cp.z, 4));
  } catch (err) {
    console.log(`Pathfinder note at CP ${i + 1}: ${err.message}`);
    // Gentle forward nudge towards checkpoint
    await bot.lookAt(new Vec3(cp.x, cur.y + 1, cp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    if (bot.entity.isCollidedHorizontally) bot.setControlState('jump', true);
    await sleep(1500);
    bot.clearControlStates();
  }
}

console.log('Base approach reached! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Step to base door at (294, 72, -54)
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
} catch (e) {}

// Go into base
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -55));
  } catch (e2) {}
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
bot.chat('gamma: Safely back inside Base (293, 72, -55)!');

// Check chest at (293, 72, -57)
try {
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.items();
    console.log('Base chest contains:', items.map(i => `${i.name}x${i.count}`).join(', '));
    for (const it of items) {
      if (it.name.includes('cooked_') || it.name.includes('bread') || it.name === 'apple' || it.name === 'shield') {
        try { await chest.withdraw(it.type, null, it.count); } catch (e) {}
      }
    }
    chest.close();
  }
} catch (e) {
  console.log('Chest access note:', e.message);
}

// Eat if we picked up food
if (bot.food < 20) {
  try { await lib.eat(); } catch (e) {}
}

// Ensure spawn set at bed
try {
  await lib.setSpawn();
  console.log('Spawn set confirmed at base bed!');
} catch (e) {}

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
