// programs/362-climb-y31-to-y43.js
console.log('=== Climb from y=31 to y=43 ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

const steps = [
  [308, 32, -41],
  [309, 33, -41],
  [310, 35, -41],
  [308, 41, -43],
  [309, 43, -44]
];

for (const [x, y, z] of steps) {
  try {
    await lib.goTo(x, y, z, 1, { timeoutMs: 6000 });
    console.log(`Step (${x}, ${y}, ${z}) -> pos: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Step (${x}, ${y}, ${z}) note:`, e.message);
  }
}

console.log('Beta pos:', lib.fmt(bot.entity.position));
