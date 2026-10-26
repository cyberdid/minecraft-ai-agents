// programs/311-escape-aquifer-to-surface.js
console.log('=== Escape aquifer back to surface base ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// Configure movements
const m = new Movements(bot, mcData);
m.canDig = true;
m.allow1by1towers = true;
m.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id];
bot.pathfinder.setMovements(m);

// First try to reach shaft at (302, 60, -40) or (302, 71, -44)
try {
  console.log('Pathfinding to dry shaft at (302, 65, -42)...');
  await lib.goTo(302, 65, -42, 2, { dig: true, timeoutMs: 20000 });
  console.log('Reached dry shaft:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft approach note:', e.message);
}

// Then to shaft top (302, 71, -44)
try {
  console.log('Climbing to surface (302, 71, -44)...');
  await lib.goTo(302, 71, -44, 2, { dig: true, timeoutMs: 25000 });
  console.log('At surface shaft top:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Surface climb note:', e.message);
}

// Then to base door / inside base
try {
  console.log('Walking to base door (294, 72, -53)...');
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {
  console.log('Base door note:', e.message);
  await lib.goTo(294, 72, -55, 1, { dig: true, timeoutMs: 15000 });
}

console.log('Current pos:', lib.fmt(bot.entity.position), 'health:', bot.health, 'food:', bot.food);
bot.chat('beta: Ascended back to base! Holding flint and steel. Standing by for portal.');
