// programs/482-regear-and-enter-nether.js
console.log('=== GAMMA: QUICK REGEAR & ENTER NETHER ===');

// 1. Quick regear macro
try {
  const gearRes = await quickRegear({ cobble: 8 });
  console.log('Regear result:', JSON.stringify(gearRes));
} catch (e) {
  console.log('Regear warning:', e.message);
}

console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 2. Step cleanly into Nether portal at (299.5, 73.0, -53.5)
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Regeared! Stepping into Nether portal...');

  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);

  // Approach portal sill
  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -53.5, 0.5));
  } catch (e) {
    await lib.goToXZ(299.5, -53.5, { timeoutMs: 6000 });
  }

  // Position inside portal block and stand still
  const portalCenter = new Vec3(299.5, 73.0, -53.5);
  await bot.lookAt(portalCenter, true);
  if (bot.entity.position.distanceTo(portalCenter) > 0.4) {
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
    await sleep(400);
    bot.clearControlStates();
  }

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  console.log('Standing still inside portal block at:', lib.fmt(bot.entity.position));
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
    await sleep(250);
  }
}

if (bot.game.dimension === 'the_nether') {
  console.log('WARP SUCCESS! In the_nether at:', lib.fmt(bot.entity.position));
  bot.chat('gamma: In Nether Base Camp! Ready for Milestone 9 gold mining & Piglin bartering!');

  // Step out of portal into bunker
  await sleep(500);
  await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
  bot.clearControlStates();
} else {
  console.log('Did not warp. Current pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  offhand: bot.inventory.slots[45]?.name,
  inv: lib.inv()
};
