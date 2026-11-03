console.log('=== Program 916: Scan Portal Camp & Mobs ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// List nearby players
for (const p of Object.values(bot.players)) {
  if (p.entity) {
    console.log(`Player ${p.username}: pos=${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// List nearby Endermen
const endermen = Object.values(bot.entities).filter(e =>
  e.isValid && e.name === 'enderman' && bot.entity.position.distanceTo(e.position) <= 48
);
console.log(`Endermen within 48m: ${endermen.length}`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)}, dist=${bot.entity.position.distanceTo(end.position).toFixed(1)}m`);
}

// List nearby Piglins
const piglins = Object.values(bot.entities).filter(e =>
  e.isValid && (e.name === 'piglin' || e.name === 'piglin_brute') && bot.entity.position.distanceTo(e.position) <= 48
);
console.log(`Piglins within 48m: ${piglins.length}`);
for (const pig of piglins) {
  console.log(`  ${pig.name} at ${lib.fmt(pig.position)}, dist=${bot.entity.position.distanceTo(pig.position).toFixed(1)}m`);
}

// List dropped items within 16m
const droppedItems = Object.values(bot.entities).filter(e =>
  e.isValid && e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 16
);
console.log(`Dropped items within 16m: ${droppedItems.length}`);
for (const it of droppedItems) {
  console.log(`  Item at ${lib.fmt(it.position)}`);
}

return {
  endermen: endermen.length,
  piglins: piglins.length,
  items: droppedItems.length,
  ender_pearls: lib.count('ender_pearl')
};
