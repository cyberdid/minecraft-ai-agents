console.log('=== PROGRAM 698: SCAN SURROUNDINGS & STEP INTO PORTAL ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Find all nether_portal blocks within 32m
const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 32, count: 20 });
console.log(`Nether portal blocks found in 32m: ${portals.length}`);
for (const p of portals) {
  console.log(`  Portal block at ${lib.fmt(p)} (dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m)`);
}

// Find obsidian blocks
const obs = bot.findBlocks({ matching: b => b && b.name === 'obsidian', maxDistance: 32, count: 10 });
console.log(`Obsidian blocks found in 32m: ${obs.length}`);
for (const o of obs) {
  console.log(`  Obsidian at ${lib.fmt(o)} (dist: ${bot.entity.position.distanceTo(o).toFixed(1)}m)`);
}

// Configure safe movements
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
moves.maxDropDown = 2;
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

// Target nearest portal block
if (portals.length > 0) {
  const target = portals[0];
  console.log(`Navigating to Portal at ${lib.fmt(target)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 0.5));
  } catch (e) {
    console.log('Pathfinder error, trying direct move:', e.message);
    await bot.lookAt(new Vec3(target.x + 0.5, target.y + 0.5, target.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(2500);
    bot.setControlState('forward', false);
  }

  console.log('Waiting for warp to Overworld...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
} else {
  console.log('No portal block in 32m? Moving towards (46, 66, 2)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(46, 66, 2, 2.0));
  } catch (e2) {
    console.log('Move error:', e2.message);
  }
}

console.log('Final dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: Status: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
