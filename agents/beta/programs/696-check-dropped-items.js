// programs/696-check-dropped-items.js
console.log('=== Program 696: Check Dropped Items & Slay Blazes ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 12);
console.log(`Found ${items.length} dropped items nearby:`);
for (const it of items) {
  const dist = bot.entity.position.distanceTo(it.position).toFixed(1);
  const dropped = it.getDroppedItem ? it.getDroppedItem() : null;
  console.log(`- Item at ${lib.fmt(it.position)}, dist: ${dist}m, data:`, dropped ? `${dropped.name} x${dropped.count}` : 'unknown');
}

// Check blazes
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) <= 8);
console.log(`Found ${blazes.length} blazes nearby:`);
for (const b of blazes) {
  console.log(`- Blaze at ${lib.fmt(b.position)}, dist: ${bot.entity.position.distanceTo(b.position).toFixed(1)}m`);
}
