console.log('=== PROGRAM 709: DIRECT SPRINT WEST INTO PORTAL ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

if (bot.game.dimension === 'the_nether') {
  bot.chat('delta: Sprinting final 10m West along z=-7 into Nether Portal!');

  // First align to z=-7.0
  await bot.lookAt(new Vec3(bot.entity.position.x, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  const alignStart = Date.now();
  while (bot.entity.position.z > -6.8 && Date.now() - alignStart < 1500) {
    await sleep(50);
  }
  bot.setControlState('forward', false);

  console.log('Aligned to z=-7.0! Pos:', lib.fmt(bot.entity.position));

  // Direct sprint-jump West along z=-7 towards x=41.0
  await bot.lookAt(new Vec3(41.0, 65.5, -7.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);

  const startRun = Date.now();
  while (Date.now() - startRun < 10000 && bot.entity.position.x > 41.5 && bot.game.dimension === 'the_nether' && !isCancelled()) {
    await bot.lookAt(new Vec3(41.0, 65.5, -7.0), true);
    await sleep(100);
  }

  // Look for portal block
  const pb = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
  if (pb) {
    console.log(`Stepping into portal block at ${lib.fmt(pb.position)}...`);
    await bot.lookAt(pb.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(2500);
  }
  bot.clearControlStates();

  console.log('Waiting for warp to Overworld...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// Overworld arrival
if (bot.game.dimension === 'overworld') {
  console.log('ARRIVED IN OVERWORLD! Pos:', lib.fmt(bot.entity.position));
  bot.chat('delta: Reunited in Overworld Base! Ready for Milestone 10 Stronghold expedition!');

  try {
    await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 15000 });
  } catch (e) {
    try {
      await lib.goToXZ(294, -53, { timeoutMs: 10000 });
      await lib.goThroughDoor(294, 72, -54);
    } catch (e2) {}
  }

  console.log('Inside Base House! Final Pos:', lib.fmt(bot.entity.position));
  bot.chat(`delta: Secure in Base House! HP: ${bot.health}/20, Food: ${bot.food}/20.`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
