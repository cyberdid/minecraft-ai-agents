// programs/355-climb-y24-to-y32.js
console.log('=== Step from y=24 to y=32 ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

const steps = [
  [303, 25, -43],
  [303, 26, -42],
  [303, 27, -42],
  [303, 28, -41],
  [304, 29, -41],
  [304, 30, -42],
  [303, 31, -42],
  [303, 32, -43]
];

for (const [x, y, z] of steps) {
  try {
    await lib.goTo(x, y, z, 1, { timeoutMs: 6000 });
    console.log(`Step (${x}, ${y}, ${z}) -> pos: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Step (${x}, ${y}, ${z}) note:`, e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
