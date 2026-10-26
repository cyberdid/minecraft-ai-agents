// programs/345-climb-y24-to-y35.js
console.log('=== Climb switchback y=20 to y=35 ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

const steps = [
  [303, 22, -47],
  [303, 24, -45],
  [303, 25, -43],
  [303, 27, -41],
  [303, 29, -41],
  [303, 31, -43],
  [303, 33, -45],
  [303, 35, -47]
];

for (const [x, y, z] of steps) {
  try {
    await lib.goTo(x, y, z, 1, { timeoutMs: 8000 });
    console.log(`Step to (${x}, ${y}, ${z}) -> pos: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Step note at (${x}, ${y}, ${z}):`, e.message);
  }
}

console.log('Beta pos after climb:', lib.fmt(bot.entity.position));
