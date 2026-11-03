// programs/477-clean-portal-warp.js
console.log('Delta at portal approach:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

if (bot.game.dimension === 'the_nether') {
  console.log('Already in the_nether!');
  return { dim: bot.game.dimension, pos: bot.entity.position };
}

// 1. Clear all controls and pathfinder
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 2. Step precisely into portal center (299.5, 73.0, -53.5)
const target = new Vec3(299.5, 73.0, -53.5);
await bot.lookAt(target.offset(0, 0.5, 0), true);
bot.setControlState('forward', true);
if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
await sleep(600);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

console.log('Standing still inside portal frame at:', lib.fmt(bot.entity.position));

// 3. Stand 100% still and wait for dimension change
const start = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - start < 20000) {
  await sleep(400);
}

console.log('Warp result. Dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat('delta: Arrived in the_nether! Marching to nether_gold_ore veins for Milestone 9.');
  // Step 1 block out of portal into bunker
  await sleep(500);
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
