// programs/282-step-up-to-y24.js
console.log('=== Program 282: Step Up to y=24 ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position));

// The cobblestone block is at (337, 24, -70)
// Bot is at (336.6, 22.0, -69.5)
// Let's place our 1 cobblestone at (336, 23, -70) as an intermediate step, or try to jump up
try {
  await lib.place('cobblestone', 336, 23, -69);
  console.log('Placed intermediate step at (336, 23, -69)!');
} catch (e) {
  console.log('Place step note:', e.message);
}

// Now jump up onto the block
try {
  const target = new Vec3(337, 25, -70);
  const movements = new Movements(bot, mcData);
  movements.canDig = false;
  movements.allowParkour = true;
  bot.pathfinder.setMovements(movements);
  await bot.pathfinder.goto(new goals.GoalBlock(target.x, target.y, target.z));
  console.log('Reached target! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Goto target note:', e.message);
}

console.log('Alpha pos now:', lib.fmt(bot.entity.position));

// Chat with team about Beta
bot.chat('gamma: Beta is at (297, 39, 2) in shaft holding 10 obsidian! Delta is at base portal frame (298, 72, -54).');
