console.log('=== PROGRAM 700: WALK TUNNEL TO PORTAL 1 (47, 66, 2) ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Configure safe digging movements
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
moves.maxDropDown = 2;
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

// Step 1: Walk along z=-8 from current x down to x=47
console.log('Step 1: Walking West along z=-8 to x=47...');
for (let x = Math.floor(bot.entity.position.x); x >= 47 && !isCancelled(); x--) {
  const feetPos = new Vec3(x, 65, -8);
  const headPos = new Vec3(x, 66, -8);

  const headBlock = bot.blockAt(headPos);
  if (headBlock && headBlock.boundingBox === 'block' && !globalThis.isProtectedBlock(headBlock)) {
    try {
      await bot.lookAt(headPos.offset(0.5, 0.5, 0.5), true);
      await bot.dig(headBlock, true);
    } catch (e) {}
  }

  const feetBlock = bot.blockAt(feetPos);
  if (feetBlock && feetBlock.boundingBox === 'block' && !globalThis.isProtectedBlock(feetBlock)) {
    try {
      await bot.lookAt(feetPos.offset(0.5, 0.5, 0.5), true);
      await bot.dig(feetBlock, true);
    } catch (e) {}
  }

  try {
    await bot.lookAt(new Vec3(x, 65.0, -8.0), true);
    bot.setControlState('forward', true);
    await sleep(200);
    bot.setControlState('forward', false);
  } catch (e) {}
}

console.log('Arrived at x=47, z=-8! Pos:', lib.fmt(bot.entity.position));

// Step 2: Walk North along x=47 from z=-8 to z=2
console.log('Step 2: Walking North along x=47 to Portal at z=2...');
const portalTarget = new Vec3(46.5, 66.0, 2.0);

try {
  await bot.pathfinder.goto(new goals.GoalNear(portalTarget.x, portalTarget.y, portalTarget.z, 0.5));
} catch (e) {
  console.log('Pathfinder error, trying direct approach:', e.message);
  await bot.lookAt(portalTarget, true);
  bot.setControlState('forward', true);
  const start = Date.now();
  while (bot.entity.position.distanceTo(portalTarget) > 1.0 && Date.now() - start < 8000) {
    if (bot.entity.isCollidedHorizontally) {
      bot.setControlState('jump', true);
      await sleep(250);
      bot.setControlState('jump', false);
    }
    await sleep(100);
  }
  bot.setControlState('forward', false);
}

// Step 3: Inside Portal block, wait for dimension change
const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 6 });
if (portalBlock) {
  console.log(`Stepping directly into portal at ${lib.fmt(portalBlock.position)}...`);
  await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);

  console.log('Waiting for dimension warp...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Current dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// Step 4: If in Overworld, enter Base House
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
  bot.chat(`delta: Safely in Overworld Base! HP: ${bot.health}/20, Food: ${bot.food}/20.`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
