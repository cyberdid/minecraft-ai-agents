// programs/304-step-walk-to-shaft.js
console.log('=== Step walk towards main shaft ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// Let's set movements properly
const m = new Movements(bot, mcData);
m.canDig = true;
m.allowParkour = true;
m.allow1by1towers = true;
m.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id, mcData.itemsByName.dirt.id].filter(Boolean);
bot.pathfinder.setMovements(m);

// Try going to (315, 48, -30) first
try {
  console.log('Going to (315, 48, -30)...');
  await bot.pathfinder.goto(new goals.GoalNear(315, 48, -30, 1));
  console.log('Reached 1:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Step 1 note:', e.message);
}

// Try going to (310, 48, -29)
try {
  console.log('Going to (310, 48, -29)...');
  await bot.pathfinder.goto(new goals.GoalNear(310, 48, -29, 1));
  console.log('Reached 2:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Step 2 note:', e.message);
}

// Check where we can reach towards (304, 54, -34)
console.log('Trying to reach (304, 54, -34)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(304, 54, -34, 2));
  console.log('Reached (304, 54, -34)! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Step 3 note:', e.message);
}
