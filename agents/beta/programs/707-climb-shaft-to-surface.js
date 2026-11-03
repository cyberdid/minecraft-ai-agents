// programs/707-climb-shaft-to-surface.js
console.log('=== Program 707: Climb Shaft to Surface ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);

bot.clearControlStates();
bot.pathfinder.stop();

// Go to Main Mine Shaft at (302, y, -44)
console.log('Moving toward Main Mine Shaft at x=302, z=-44...');
try {
  await lib.goTo(302, bot.entity.position.y, -44, 2.0, { timeoutMs: 10000 });
} catch (e) {
  console.log('goTo shaft base note:', e.message);
  try { await lib.goToXZ(302, -44, { timeoutMs: 8000 }); } catch (e2) {}
}

console.log('Near shaft. Pos:', lib.fmt(bot.entity.position));

// Ascend the staircase to surface at (302, 71, -44)
console.log('Ascending staircase to surface at (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 1.5, { timeoutMs: 25000 });
} catch (e) {
  console.log('Ascend note:', e.message);
  // If pathfinder struggles on stairs, ascend in steps of 5 blocks
  for (let targetY = Math.floor(bot.entity.position.y) + 4; targetY <= 72; targetY += 4) {
    try {
      await lib.goTo(302, targetY, -44, 2.0, { timeoutMs: 6000 });
      console.log(`Reached y=${bot.entity.position.y.toFixed(1)}`);
    } catch (e2) {}
  }
}

console.log('Current Pos after ascent:', lib.fmt(bot.entity.position));

// Once on surface (y >= 70), walk to Nether portal at (299.5, 73.0, -54.0)
if (bot.entity.position.y >= 70) {
  console.log('On surface! Walking to Nether Portal at (299.5, 73.0, -54.0)...');
  try {
    await lib.goTo(299.5, 73.0, -54.0, 0.8, { timeoutMs: 10000 });
  } catch (e) {}

  const portalTarget = new Vec3(299.5, 73.0, -54.0);
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (cur.distanceTo(portalTarget) > 0.8) {
      await bot.lookAt(portalTarget, true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(250);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(350);
  }
  bot.clearControlStates();
}

console.log('Program 707 complete. Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  blaze_rods: lib.count('blaze_rod')
};
