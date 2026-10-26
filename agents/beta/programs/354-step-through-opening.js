// programs/354-step-through-opening.js
console.log('=== Step through opened staircase up to y=33 ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

const waypoints = [
  [303, 25, -44],
  [303, 27, -42],
  [304, 29, -41],
  [304, 31, -42],
  [303, 33, -43]
];

for (const [x, y, z] of waypoints) {
  try {
    await lib.goTo(x, y, z, 1, { timeoutMs: 10000 });
    console.log(`Reached (${x}, ${y}, ${z})! Current pos:`, lib.fmt(bot.entity.position));
  } catch (e) {
    console.log(`Note at (${x}, ${y}, ${z}):`, e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
bot.chat(`beta: Ascended to ${lib.fmt(bot.entity.position)}! Climbing to surface.`);
