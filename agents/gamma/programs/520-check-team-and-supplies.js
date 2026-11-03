// programs/520-check-team-and-supplies.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 520: TEAM & STATUS UPDATE ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Check nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name}: at ${lib.fmt(p.entity.position)} (${d}m), held: ${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name}: not in render distance`);
  }
}

// Check nearby items
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 20);
console.log(`Items within 20m: ${items.length}`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)} dist: ${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// Check if anyone dropped food or gold
await lib.pickup(5.0);

console.log('Inventory:', lib.inv());

return {
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  dim: bot.game.dimension,
  inv: lib.inv()
};
