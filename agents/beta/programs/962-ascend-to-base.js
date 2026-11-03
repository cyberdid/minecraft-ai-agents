console.log('=== Program 962: Ascend via Mine Shaft or Safe Staircase ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Look for open air / stairs / ladders towards (302, 53..71, -44)
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
moves.maxDropDown = 3;
bot.pathfinder.setMovements(moves);

// Target base of main mine shaft at (302, y, -44) or surface
console.log('Pathfinding towards Main Mine Shaft at (302, 71, -44)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(302, 71, -44, 2.0));
  console.log('Arrived at Main Mine Shaft entrance (y=71)! Current pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Pathfind to mine entrance error:', e.message);
  // Try navigating in vertical stages
  const curY = Math.floor(bot.entity.position.y);
  for (let targetY = curY + 5; targetY <= 72; targetY += 5) {
    console.log(`Climbing to stage y=${targetY}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(298, targetY, -48, 3.0));
    } catch (e2) {
      console.log(`Stage y=${targetY} error:`, e2.message);
      break;
    }
  }
}

// Once near surface (y >= 70), enter Base House at (293, 72, -56)
if (bot.entity.position.y >= 70) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1.0));
  } catch (e) {}
}

console.log('Current Beta Position:', lib.fmt(bot.entity.position));
return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
