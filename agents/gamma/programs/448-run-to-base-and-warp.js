// programs/448-run-to-base-and-warp.js
console.log('=== RUN TO BASE & WARP NETHER (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.maxDropDown = 3;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

bot.chat('gamma: Sprinting directly home to Base (294, 72, -54)...');

// Intermediate points towards base (294, 72, -54)
const toBasePoints = [
  { x: 170, z: -110 },
  { x: 230, z: -80 },
  { x: 280, z: -60 },
  { x: 294, z: -53 }
];

for (let i = 0; i < toBasePoints.length && !isCancelled(); i++) {
  const pt = toBasePoints[i];
  const cur = bot.entity.position;
  const dist = Math.hypot(cur.x - pt.x, cur.z - pt.z);
  console.log(`[To Base ${i + 1}/${toBasePoints.length}] -> (${pt.x}, ${pt.z}) [dist: ${dist.toFixed(1)}m]`);

  if (dist < 5.0) continue;

  try {
    await bot.pathfinder.goto(new goals.GoalNearXZ(pt.x, pt.z, 4));
  } catch (err) {
    console.log(`Pathfinder nudge at pt ${i + 1}: ${err.message}`);
    await bot.lookAt(new Vec3(pt.x, cur.y + 1, pt.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    if (bot.entity.isCollidedHorizontally) bot.setControlState('jump', true);
    await sleep(2000);
    bot.clearControlStates();
  }
}

console.log('At Base area! Pos:', lib.fmt(bot.entity.position));

// Enter base door at (294, 72, -54)
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -55));
  } catch (e2) {}
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
bot.chat('gamma: Inside Base! Setting spawn and grabbing gear...');

// Set spawn at base bed
try {
  await lib.setSpawn();
  console.log('Spawn set confirmed at base bed!');
} catch (e) {
  console.log('lib.setSpawn note:', e.message);
}

// Check base chest at (293, 72, -57)
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

// Equip armor / shield / weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Exit base door to outside
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// Step into Nether portal at (299.5, 73.0, -53.5)
console.log('Entering Nether Portal...');
bot.chat('gamma: Entering Nether Portal to rejoin frontlines at Spawner Pillbox!');
const warp = await globalThis.enterNetherPortal();
console.log('Nether warp result:', warp);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
