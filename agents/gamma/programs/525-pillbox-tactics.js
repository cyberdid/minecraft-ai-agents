// programs/525-pillbox-tactics.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 525: PILLBOX TACTICAL INSPECTION ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Keep shield actively raised for 100% protection
bot.activateItem(true);

// 1. Check nearby items within 8m
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 8);
console.log(`Nearby items (${items.length}):`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)} dist ${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// 2. Safe pickup of drops within pillbox reach (x >= 36)
if (items.length > 0) {
  try {
    await lib.pickup(3.5);
    console.log('Vacuumed drops! Current inventory:', lib.inv());
  } catch (e) {}
}

// 3. Check Alpha's status
const alpha = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'alpha');
if (alpha) {
  console.log(`Alpha at ${lib.fmt(alpha.position)} (dist: ${bot.entity.position.distanceTo(alpha.position).toFixed(1)}m), held: ${alpha.heldItem?.name}`);
} else {
  console.log('Alpha not in immediate render distance.');
}

// 4. Check nearby Blazes
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze' && e.isValid);
console.log(`Blazes nearby (${blazes.length}):`);
for (const b of blazes) {
  console.log(`  Blaze at ${lib.fmt(b.position)} dist: ${bot.entity.position.distanceTo(b.position).toFixed(1)}m HP: ${b.health}`);
}

const rods = lib.count('blaze_rod');
console.log(`Rods in inventory: ${rods}`);

return {
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  itemsCount: items.length,
  blazesCount: blazes.length,
  rods,
  inv: lib.inv()
};
