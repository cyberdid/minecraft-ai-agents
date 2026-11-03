// programs/537-inspect-tunnel-and-unite.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 537: INSPECT TUNNEL & UNITE ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Scan nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (${d}m), held: ${p.entity.heldItem?.name}`);
  }
}

// 2. Scan nearby mobs within 32m
const mobs = Object.values(bot.entities).filter(e => e.type === 'mob' && bot.entity.position.distanceTo(e.position) <= 32);
console.log(`Nearby mobs (${mobs.length}):`);
for (const m of mobs) {
  const d = bot.entity.position.distanceTo(m.position).toFixed(1);
  console.log(`  ${m.name} at ${lib.fmt(m.position)} (dist: ${d}m)`);
}

// 3. Scan dropped items within 16m
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 16);
console.log(`Nearby items (${items.length}):`);
for (const it of items) {
  const d = bot.entity.position.distanceTo(it.position).toFixed(1);
  console.log(`  Item at ${lib.fmt(it.position)} (dist: ${d}m)`);
}

// 4. Safe pickup
await lib.pickup(4.0);

console.log('Inventory:', lib.inv());

return {
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  mobsCount: mobs.length,
  itemsCount: items.length,
  inv: lib.inv()
};
