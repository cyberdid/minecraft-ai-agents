console.log('=== PROGRAM 710: PATHFINDER DIRECT TO PORTAL 2 (41, 65, -7) ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Enable pathfinder movements
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
moves.maxDropDown = 3;
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

console.log('Navigating pathfinder to (41.5, 65.0, -7.0)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(41.5, 65.0, -7.0, 0.5));
  console.log('Arrived at portal target! Pos:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('Pathfinder notice:', err.message);
  // Fallback: check what is blocking right in front
  const eye = bot.entity.position.offset(0, 1.6, 0);
  console.log('Eye pos:', lib.fmt(eye));
}

// Step into portal block
const pb = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
if (pb) {
  console.log(`Stepping into nether_portal block at ${lib.fmt(pb.position)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(pb.position.x, pb.position.y, pb.position.z, 0.4));
  } catch (e) {
    await bot.lookAt(pb.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(2000);
    bot.setControlState('forward', false);
  }

  console.log('Inside Portal! Waiting for warp to Overworld...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// In Overworld: enter Base House at (293, 72, -55)
if (bot.game.dimension === 'overworld') {
  console.log('ARRIVED IN OVERWORLD! Pos:', lib.fmt(bot.entity.position));
  try {
    if (bot.entity.position.distanceTo(new Vec3(293.5, 72.0, -56.0)) > 3.0) {
      await lib.goToXZ(294, -53, { timeoutMs: 12000 });
      await lib.goThroughDoor(294, 72, -54);
    }
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 1.0));
    } catch (e2) {}
  }
  bot.chat(`delta: Secure in Overworld Base House! HP: ${bot.health}/20, Food: ${bot.food}/20.`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
