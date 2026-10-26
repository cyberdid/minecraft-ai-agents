// programs/225-inspect-local.js
console.log('=== INSPECT LOCAL POSITION & BLOCKS ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Inventory:', JSON.stringify(lib.inv()));

// Check dropped items within 10m
const dropped = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 15);
console.log(`Dropped items within 15m (${dropped.length}):`);
for (const it of dropped) {
  console.log(` - Item entity ${it.id} at ${lib.fmt(it.position)}`);
}

// Check nearby tree logs within 8m
const logs = bot.findBlocks({
  matching: b => b && b.name.includes('log'),
  maxDistance: 8,
  count: 10
});
console.log(`Nearby tree logs (${logs.length}):`, logs.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// Check nearby players
for (const p of Object.values(bot.players)) {
  const ent = p.entity;
  if (ent) {
    console.log(`Player ${p.username} at ${lib.fmt(ent.position)} dist=${bot.entity.position.distanceTo(ent.position).toFixed(1)}m`);
  }
}
