// programs/144-check-entities-and-health.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// Dropped items scan
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 32);
console.log(`Nearby dropped items (${items.length}):`);
for (const it of items) {
  const d = bot.entity.position.distanceTo(it.position);
  let name = 'unknown';
  let count = 1;
  try {
    if (typeof it.getDroppedItem === 'function') {
      const o = it.getDroppedItem();
      if (o) { name = o.name; count = o.count; }
    }
  } catch (e) {}
  console.log(`- ${count}x ${name} at ${lib.fmt(it.position)} dist ${d.toFixed(1)}m`);
}

// Hostiles scan
const hostiles = Object.values(bot.entities).filter(e => (e.type === 'mob' || e.type === 'hostile') && bot.entity.position.distanceTo(e.position) < 32);
console.log(`Nearby hostiles (${hostiles.length}):`);
for (const h of hostiles) {
  const d = bot.entity.position.distanceTo(h.position);
  console.log(`- ${h.name} at ${lib.fmt(h.position)} dist ${d.toFixed(1)}m`);
}

bot.chat('delta: Holding fortified bridgehead at (44, 65, -133). Advance tunnel is sealed and safe.');
