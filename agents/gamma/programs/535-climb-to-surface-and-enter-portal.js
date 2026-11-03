// programs/535-climb-to-surface-and-enter-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 535: CLIMB TO SURFACE & ENTER PORTAL ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Ensure head clearance up to surface y=72
const startPos = bot.entity.position;
if (startPos.y < 71) {
  console.log(`Currently at y=${startPos.y.toFixed(1)}, below surface y=72. Ascending...`);
  
  // Dig head blocks if obstructed
  for (let dy = 2; dy <= 4; dy++) {
    const b = bot.blockAt(startPos.offset(0, dy, 0));
    if (b && b.name !== 'air' && b.boundingBox === 'block') {
      try {
        await bot.dig(b);
      } catch (e) {}
    }
  }

  // Use pathfinder or tower up to surface (293, 72, -55)
  try {
    await lib.goTo(293, 72, -55, 1.5, { dig: true, timeoutMs: 12000 });
  } catch (e) {
    console.log('goTo surface note:', e.message);
  }
}

console.log('Position after ascent:', lib.fmt(bot.entity.position));

// Step 2: Ensure on surface y >= 71
if (bot.entity.position.y < 71) {
  console.log('Still below y=71, jumping and placing blocks underfoot...');
  // Equip cobble or soul sand
  const blockItem = bot.inventory.items().find(i => ['cobblestone', 'soul_sand', 'dirt', 'netherrack'].includes(i.name));
  if (blockItem) {
    while (bot.entity.position.y < 72 && !isCancelled()) {
      const curY = Math.floor(bot.entity.position.y);
      // Dig above
      const up = bot.blockAt(bot.entity.position.offset(0, 2, 0));
      if (up && up.name !== 'air') {
        try { await bot.dig(up); } catch (e) {}
      }
      bot.setControlState('jump', true);
      await sleep(350);
      bot.setControlState('jump', false);
      const floorBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
      if (floorBlock) {
        try {
          await bot.equip(blockItem, 'hand');
          await bot.placeBlock(floorBlock, new Vec3(0, 1, 0));
        } catch (e) {}
      }
      await sleep(200);
    }
  }
}

console.log('Confirmed surface position:', lib.fmt(bot.entity.position));

// Step 3: Enter Nether Portal at (299.5, 73.0, -53.5)
bot.chat('gamma: Ascended to surface! Entering Nether portal now!');
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -53.5, 1.0));
} catch (e) {
  try { await lib.goTo(299, 72, -52, 1.5, { timeoutMs: 6000 }); } catch (e2) {}
}

const target = new Vec3(299.5, 73.0, -53.5);
await bot.lookAt(target, true);
bot.setControlState('forward', true);
if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
await sleep(800);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Inside portal frame! Awaiting warp...');
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
  const cur = bot.entity.position;
  if (Math.abs(cur.x - 299.5) > 0.4 || Math.abs(cur.z - (-53.5)) > 0.4 || cur.y < 72.8) {
    await bot.lookAt(target, true);
    bot.setControlState('forward', true);
    if (cur.y < 72.8) bot.setControlState('jump', true);
    await sleep(200);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  await sleep(250);
}

if (bot.game.dimension === 'the_nether') {
  await sleep(400);
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
  bot.chat(`gamma: Arrived in the_nether at ${lib.fmt(bot.entity.position)}! HP: ${bot.health}/20.`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
