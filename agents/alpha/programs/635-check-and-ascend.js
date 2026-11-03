// programs/635-check-and-ascend.js
console.log('=== Program 635: Inspect Position & Ascend to Surface Base ===');
const pos = bot.entity.position;
console.log('Current pos:', lib.fmt(pos), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

const bAt = bot.blockAt(pos);
const bDown = bot.blockAt(pos.offset(0, -1, 0));
const bUp = bot.blockAt(pos.offset(0, 1, 0));
const bHead = bot.blockAt(pos.offset(0, 2, 0));
console.log(`Blocks at pos: feet=${bAt?.name}, down=${bDown?.name}, up=${bUp?.name}, head=${bHead?.name}`);

// Check nearby blocks around pos
const nearby = [];
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    for (let dy = -1; dy <= 2; dy++) {
      const b = bot.blockAt(pos.offset(dx, dy, dz));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        nearby.push(`${b.name}@(${pos.x+dx},${pos.y+dy},${pos.z+dz})`);
      }
    }
  }
}
console.log('Nearby non-air blocks:', nearby.slice(0, 15).join(', '));

// Try to navigate to base surface (293, 72, -55)
console.log('Attempting path to base surface (293, 72, -55)...');
try {
  await lib.goTo(293, 72, -55, 1, { timeoutMs: 25000 });
  console.log('Successfully reached base surface! Pos:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('lib.goTo failed:', err.message);
  // If failed, let's see if we can dig/tower up or find the mine shaft stairs
  console.log('Attempting goTo with dig: true...');
  try {
    await lib.goTo(293, 72, -55, 1, { dig: true, timeoutMs: 35000 });
    console.log('Reached base surface with dig! Pos:', lib.fmt(bot.entity.position));
  } catch (err2) {
    console.log('lib.goTo with dig failed:', err2.message);
  }
}

console.log('End pos:', lib.fmt(bot.entity.position));
