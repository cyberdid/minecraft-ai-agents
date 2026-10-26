// programs/506-walk-37m-into-portal.js
console.log('=== Step: Walk 37m into Nether Portal & Transit ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Walk directly to portal frame at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Walking 37m to portal target:', lib.fmt(portalTarget));

try {
  await lib.goTo(285, 70, -58, 2.0);
  console.log('Reached checkpoint at', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.walkTo(285, -58); } catch (e2) {}
}

try {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.4);
  console.log('Reached portal block via goTo:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goTo portal note, stepping manually:', e.message);
  await bot.lookAt(portalTarget.offset(0, 0.5, 0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  await sleep(500);
  bot.clearControlStates();
}

// Clear all control states to stand completely still inside portal
bot.clearControlStates();
console.log('Standing still inside portal at:', lib.fmt(bot.entity.position));

// 2. Wait up to 14s for Nether transit (80 ticks = 4s in survival)
for (let s = 0; s < 14; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
    console.log(`SUCCESS: IN THE NETHER at second ${s+1}! Pos:`, lib.fmt(bot.entity.position));
    break;
  }
}

console.log('Final dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
bot.chat(`beta: In dimension ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}! Moving to Fortress Outpost!`);
