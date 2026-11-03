console.log('=== PROGRAM 702: WALK Z=-7 CORRIDOR TO PORTAL ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Enable dig and pathfinder
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
moves.maxDropDown = 2;
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

// 1. Shift to z=-7.0
console.log('Aligning to z=-7.0...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(63.0, 65.0, -7.0, 0.4));
} catch (e) {
  await bot.lookAt(new Vec3(63.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('forward', false);
}

console.log('Aligned! Pos:', lib.fmt(bot.entity.position));

// 2. March West along z=-7 down to x=47
console.log('Marching West along z=-7...');
const targetX = 47.0;
for (let x = Math.floor(bot.entity.position.x); x >= targetX && !isCancelled(); x--) {
  const target = new Vec3(x, 65.0, -7.0);

  // Clear any obstacle at head or feet
  for (const dy of [0, 1]) {
    const b = bot.blockAt(new Vec3(x, 65 + dy, -7));
    if (b && b.boundingBox === 'block' && !globalThis.isProtectedBlock(b)) {
      console.log(`Digging obstacle at (${x}, ${65 + dy}, -7): ${b.name}`);
      try { await bot.dig(b, true); } catch (e) {}
    }
  }

  // Step forward
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  const stepStart = Date.now();
  while (bot.entity.position.x > x + 0.3 && Date.now() - stepStart < 1200) {
    if (bot.entity.isCollidedHorizontally) {
      bot.setControlState('jump', true);
      await sleep(200);
      bot.setControlState('jump', false);
    }
    await sleep(50);
  }
  bot.setControlState('forward', false);
}

console.log('Reached West end! Pos:', lib.fmt(bot.entity.position));

// 3. Find nearest portal block
const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
if (portalBlock) {
  console.log(`Found portal at ${lib.fmt(portalBlock.position)}! Entering...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z, 0.5));
  } catch (e) {
    await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(2000);
    bot.setControlState('forward', false);
  }

  console.log('Waiting for warp to Overworld...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// 4. If in Overworld, enter Base House
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld! Walking into Base House (293, 72, -55)...');
  try {
    await lib.goToXZ(294, -53, { timeoutMs: 12000 });
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 1.0));
    } catch (e2) {}
  }
  bot.chat(`delta: Secure in Overworld Base House! HP: ${bot.health}/20, Food: ${bot.food}/20. Ready for Stronghold expedition!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
