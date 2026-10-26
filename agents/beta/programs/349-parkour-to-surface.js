// programs/349-parkour-to-surface.js
console.log('=== Test direct pathfinder with parkour enabled ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

bot.chat('beta: Climbing shaft with parkour enabled towards surface (302, 71, -44)!');

const m = new Movements(bot, mcData);
m.allowParkour = true;
m.allowSprinting = true;
m.canDig = false;
bot.pathfinder.setMovements(m);

try {
  console.log('Pathfinding to surface shaft top (302, 71, -44)...');
  await bot.pathfinder.goto(new goals.GoalNear(302, 71, -44, 3));
  console.log('Reached surface! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Direct goto note:', e.message);
}

// If direct failed, let's test short increments
const increments = [
  [304, 25, -40],
  [304, 35, -36],
  [304, 50, -36],
  [303, 62, -38],
  [302, 71, -44]
];

for (const [x, y, z] of increments) {
  try {
    console.log(`Going to (${x}, ${y}, ${z})...`);
    await bot.pathfinder.goto(new goals.GoalNear(x, y, z, 2));
    console.log(`Reached (${x}, ${y}, ${z}):`, lib.fmt(bot.entity.position));
  } catch (err) {
    console.log(`Increment note at (${x}, ${y}, ${z}):`, err.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
