// programs/892-step-onto-portal.js
console.log('=== Program 892: Step Onto Portal (46.5, 66.0, 2.0) ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

const portalCenter = new Vec3(46.5, 66.0, 2.0);
console.log(`Walking up to Nether Portal center at ${lib.fmt(portalCenter)}...`);

try {
  await lib.goTo(portalCenter.x, portalCenter.y, portalCenter.z, 0.5, { dig: false, timeoutMs: 8000 });
} catch (e) {
  console.log(`goTo note: ${e.message}`);
  try { await bot.pathfinder.goto(new goals.GoalBlock(portalCenter.x, portalCenter.y, portalCenter.z)); } catch (e2) {}
}

// Stand still inside portal
bot.clearControlStates();
bot.pathfinder.stop();

console.log('Inside portal frame, standing still for warp...');
const start = Date.now();
while (bot.game.dimension === 'the_nether' && Date.now() - start < 15000 && !checkCancelled()) {
  await sleep(250);
}

console.log(`Dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
