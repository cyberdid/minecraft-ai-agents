// programs/517-inspect-current-state.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== GAMMA: STATE INSPECTION ===');
console.log('Dimension:', bot.game.dimension);
console.log('Position:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// List nearby players
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Players nearby (${players.length}):`);
for (const p of players) {
  console.log(`  - ${p.username} at ${lib.fmt(p.position)} (dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
}

// List nearby mobs
const mobs = Object.values(bot.entities).filter(e => e.type === 'mob');
console.log(`Mobs nearby (${mobs.length}):`);
for (const m of mobs) {
  console.log(`  - ${m.name} at ${lib.fmt(m.position)} (dist: ${bot.entity.position.distanceTo(m.position).toFixed(1)}m)`);
}

// List nearby items
const items = Object.values(bot.entities).filter(e => e.name === 'item');
console.log(`Items nearby (${items.length}):`);
for (const it of items) {
  console.log(`  - item at ${lib.fmt(it.position)} (dist: ${bot.entity.position.distanceTo(it.position).toFixed(1)}m)`);
}

// Check equipped items
console.log('Equipped:');
console.log('  head:', bot.inventory.slots[5]?.name);
console.log('  torso:', bot.inventory.slots[6]?.name);
console.log('  legs:', bot.inventory.slots[7]?.name);
console.log('  feet:', bot.inventory.slots[8]?.name);
console.log('  offhand:', bot.inventory.slots[45]?.name);
console.log('  held:', bot.heldItem?.name);

// Check inventory summary
console.log('Inventory summary:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  playersCount: players.length,
  mobsCount: mobs.length,
  itemsCount: items.length
};
