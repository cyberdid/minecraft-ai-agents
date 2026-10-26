// programs/341-spiral-up-shaft.js
console.log('=== Ascend spiral staircase in 6-block increments ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

bot.chat('beta: Climbing shaft spiral to base in 6-block stages!');

const waypoints = [
  [302, 21, -44],
  [303, 27, -45],
  [303, 34, -44],
  [304, 42, -42],
  [304, 50, -42],
  [303, 60, -43],
  [302, 71, -44]
];

for (const [x, y, z] of waypoints) {
  console.log(`Ascending to (${x}, ${y}, ${z})...`);
  try {
    await lib.goTo(x, y, z, 2, { timeoutMs: 15000 });
    console.log(`Reached (${x}, ${y}, ${z})! Pos:`, lib.fmt(bot.entity.position));
  } catch (e) {
    console.log(`Note at (${x}, ${y}, ${z}):`, e.message);
  }
}

// Walk to base door (294, 72, -54)
console.log('Entering base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base with team!');
  bot.chat('beta: Safely inside base with team! Ready for Milestone 3 full iron armor prep!');
} catch (e) {
  console.log('Base entry note:', e.message);
}

console.log('Final pos:', lib.fmt(bot.entity.position));
