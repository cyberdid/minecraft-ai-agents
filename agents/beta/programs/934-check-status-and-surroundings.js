console.log('=== Program 934: Check Surroundings and Team ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Bot pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);

// Teammates
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username) {
    if (p.entity) {
      console.log(`Teammate ${p.username}: pos=${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
    } else {
      console.log(`Teammate ${p.username}: not within entity render distance`);
    }
  }
}

// Entities within 16m
const nearby = Object.values(bot.entities).filter(e =>
  e.isValid && e !== bot.entity && bot.entity.position.distanceTo(e.position) <= 16
);
console.log(`Nearby entities within 16m: ${nearby.length}`);
for (const e of nearby) {
  console.log(`  ${e.name || e.type} (id=${e.id}) at ${lib.fmt(e.position)}, dist=${bot.entity.position.distanceTo(e.position).toFixed(1)}m`);
}

// Check if there are dropped items nearby
const droppedItems = Object.values(bot.entities).filter(e =>
  e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 10
);
console.log(`Dropped items within 10m: ${droppedItems.length}`);

// Check inventory
console.log('Inventory:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: lib.count('ender_pearl'),
  nearbyEntities: nearby.map(e => ({ name: e.name, pos: lib.fmt(e.position), dist: bot.entity.position.distanceTo(e.position).toFixed(1) }))
};
