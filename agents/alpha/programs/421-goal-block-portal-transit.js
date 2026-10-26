// programs/421-goal-block-portal-transit.js
console.log('=== Program 421: GoalBlock Portal Transit to Nether ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Move exactly into nether_portal at (299, 73, -54)
console.log('Pathfinding to GoalBlock(299, 73, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
} catch (e) {
  console.log('GoalBlock note:', e.message);
  // Manual jump-in fallback
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  await sleep(400);
  bot.setControlState('forward', false);
}

// Clear any pathfinder goal so bot stays 100% stationary
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Standing at:', lib.fmt(bot.entity.position), 'Block at feet:', bot.blockAt(bot.entity.position)?.name);

// 2. Wait stationary for portal effect and dimension transition
console.log('Waiting stationary inside portal for dimension change...');
for (let wait = 0; wait < 30; wait++) {
  if (bot.game.dimension === 'the_nether') {
    console.log('*** TRANSIT COMPLETE! ALPHA IS IN THE NETHER! ***');
    break;
  }
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);
console.log('Alpha position:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha entered the Nether! Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}, Cobble=${lib.count('cobblestone')}. Advancing along East Ridge trail to Fortress Workshop at (44, 65, -133)!`);
}

console.log('Alpha status:', JSON.stringify(lib.status()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
