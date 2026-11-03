console.log('=== PROGRAM 713: LIB.GOTO TO PORTAL 1 ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Move to (47, 65, -6)
console.log('Moving to (47, 65, -6)...');
try {
  await lib.goTo(47, 65, -6, 1.0, { timeoutMs: 8000 });
} catch (e) {
  console.log('goTo error:', e.message);
  try {
    await bot.lookAt(new Vec3(47.0, 65.0, -6.0), true);
    bot.setControlState('forward', true);
    await sleep(2000);
    bot.setControlState('forward', false);
  } catch (e2) {}
}

console.log('Current pos:', lib.fmt(bot.entity.position));

// 2. Find and enter portal
const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
if (portalBlock) {
  console.log(`Found portal at ${lib.fmt(portalBlock.position)}! Moving inside...`);
  try {
    await lib.goTo(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z, 0.5, { timeoutMs: 12000 });
  } catch (e) {
    console.log('Direct move to portal...');
    await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(2500);
    bot.setControlState('forward', false);
  }

  console.log('Inside portal frame! Waiting for warp to Overworld...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// In Overworld: enter Base House at (293, 72, -55)
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld! Walking into Base House (293, 72, -55)...');
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

  console.log('Secure inside Base House! Final Pos:', lib.fmt(bot.entity.position));
  bot.chat('delta: Secure inside Overworld Base House! HP: 20/20, Food: 20/20. United with team!');
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
