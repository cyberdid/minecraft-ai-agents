// programs/351-climb-y23-to-y33.js
console.log('=== Climb stairs from y=23 to y=33 ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

const steps = [
  [303, 25, -43],
  [303, 27, -42],
  [304, 29, -41],
  [304, 31, -42],
  [303, 33, -43]
];

for (const [x, y, z] of steps) {
  try {
    await lib.goTo(x, y, z, 1, { timeoutMs: 8000 });
    console.log(`Reached (${x}, ${y}, ${z}) -> pos: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Step note at (${x}, ${y}, ${z}):`, e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
