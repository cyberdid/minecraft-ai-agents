// programs/374-ascend-with-can-dig.js
console.log('=== Ascend ramp to surface base with canDig = true ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

bot.chat('beta: Ascending ramp to base with canDig=true!');

const m = new Movements(bot, mcData);
m.canDig = true;
m.allowParkour = true;
m.allow1by1towers = false;
bot.pathfinder.setMovements(m);

const stages = [
  [311, 34, -41],
  [309, 44, -44],
  [304, 54, -34],
  [302, 71, -44]
];

for (const [x, y, z] of stages) {
  console.log(`Ascending to (${x}, ${y}, ${z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(x, y, z, 2));
    console.log(`Reached (${x}, ${y}, ${z})! Current pos:`, lib.fmt(bot.entity.position));
  } catch (e) {
    console.log(`Note at (${x}, ${y}, ${z}):`, e.message);
  }
}

// Enter base door
console.log('Entering base...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base with team!');
  bot.chat('beta: Inside base with team! Milestone 7 complete, ready for full iron armor prep!');
} catch (e) {
  console.log('Base entry note:', e.message);
}

console.log('Final pos:', lib.fmt(bot.entity.position));
