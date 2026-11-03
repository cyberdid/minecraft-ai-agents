// programs/484-goto-portal-block.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true; // allow jumping up 1 block
bot.pathfinder.setMovements(moves);

console.log('Pathfinding to GoalBlock(299, 73, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
  console.log('Pathfinder reached portal block! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('GoalBlock error:', e.message);
  // Fallback: look at portal block center and walk into it
  const center = new Vec3(299.5, 73.5, -54.0);
  await bot.lookAt(center, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
  await sleep(800);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
}

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Position inside portal block:', lib.fmt(bot.entity.position));

// Hold position until warped
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 15000) {
  await sleep(350);
}

console.log('Warp result: dim=', bot.game.dimension, 'pos=', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat('delta: Arrived in the_nether! Safe in bunker (40, 65, -7). Joining team for Milestone 9 gold & pearls!');
  await sleep(400);
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
