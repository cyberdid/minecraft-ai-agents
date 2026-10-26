// programs/459-check-ghast-and-alpha-drops.js
console.log('=== Step: Check Ghast & Alpha Drops ===');
console.log('Beta pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 1. Check all mobs within 60m (especially ghast, wither skeleton, blaze)
const mobs = Object.values(bot.entities).filter(e => e.type === 'mob');
console.log(`Mobs within render (${mobs.length}):`);
for (const m of mobs) {
  const d = bot.entity.position.distanceTo(m.position);
  if (d < 60) {
    console.log(`  ${m.name} at ${lib.fmt(m.position)} (dist ${d.toFixed(1)}m)`);
  }
}

// 2. Check all items on ground within 25m
const items = Object.values(bot.entities).filter(e => e.name === 'item');
console.log(`Items within render (${items.length}):`);
for (const it of items) {
  const d = bot.entity.position.distanceTo(it.position);
  if (d < 25) {
    console.log(`  Item at ${lib.fmt(it.position)} dist=${d.toFixed(1)}m metadata=`, JSON.stringify(it.metadata));
  }
}

// 3. Where is Delta?
const delta = bot.players['delta']?.entity;
if (delta) {
  console.log('Delta pos:', lib.fmt(delta.position));
} else {
  console.log('Delta entity not loaded');
}
