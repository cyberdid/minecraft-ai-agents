// programs/587-warp-to-nether-and-exit-frame.js
console.log('=== Step: Walk to Portal, Warp to Nether & Step Out of Frame ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Walk into portal block at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Walking into portal at (299.5, 73.0, -54.0)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
}

console.log('Inside portal frame! Pos:', lib.fmt(bot.entity.position));

// 2. Stand completely still and wait for dimension change
const startDim = bot.game.dimension;
for (let s = 0; s < 15; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`DIMENSION CHANGED! New dim: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

// 3. If in Nether, IMMEDIATELY step forward out of portal frame
if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (46, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(2000);
  bot.clearControlStates();
  console.log('Safely in Nether outside portal! Pos:', lib.fmt(bot.entity.position));
  bot.chat(`beta: Safely arrived in Nether at ${lib.fmt(bot.entity.position)}! Ready to reinforce team.`);
} else {
  console.log('Warp not triggered yet. Current dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position
};
