console.log('=== Player Inspection ===');
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name}: pos ${lib.fmt(p.entity.position)}, health: ${p.entity.health || '?'}, held: ${p.entity.heldItem?.name || 'none'}`);
  } else {
    console.log(`Player ${name}: offline / no entity loaded`);
  }
}

// Check nearby chests or dropped items
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 15);
console.log('Nearby dropped items:', items.length);
for (const it of items) {
  console.log(`- Dropped: id=${it.id}, dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}
