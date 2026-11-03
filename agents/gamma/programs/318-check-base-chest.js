// programs/318-check-base-chest.js
console.log('=== CHECK BASE CHEST ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Chest contents at (293, 72, -57):', JSON.stringify(contents));
} catch (e) {
  console.log('Chest note:', e.message);
}

// Check if any item drops are on the floor inside the base
const items = Object.values(bot.entities).filter(e => e && e.name === 'item');
console.log(`Dropped items nearby (${items.length}):`, items.map(i => `${lib.fmt(i.position)}`));

console.log('Gamma inv:', JSON.stringify(lib.inv()));
