// programs/250-inspect-dropped-loot-and-route.js
console.log('=== INSPECT DROPPED LOOT & ROUTE IN NETHER ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Scan dropped items within 30m
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 32);
console.log(`\nDropped items found nearby (${items.length}):`);
for (const it of items) {
  console.log(` - Item entity id=${it.id} pos=${lib.fmt(it.position)} dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// 2. Scan fire blocks in path towards x=55, z=0
const fires = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
  maxDistance: 24,
  count: 20
});
console.log(`\nFire blocks nearby (${fires.length}):`, fires.map(p => lib.fmt(p)));

// 3. Scan hostiles (Ghast, Piglins, etc.)
const hostiles = lib.hostiles(32);
console.log(`\nHostiles within 32m (${hostiles.length}):`);
for (const h of hostiles) {
  const e = bot.entities[h.id];
  console.log(` - ${h.name} at ${lib.fmt(e ? e.position : h.pos)} (dist: ${h.dist.toFixed(1)}m)`);
}

// 4. Teammates
console.log('\n--- TEAMMATES ---');
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username) {
    const ent = p.entity;
    console.log(`${p.username}: ${ent ? `${lib.fmt(ent.position)} (dist: ${bot.entity.position.distanceTo(ent.position).toFixed(1)}m, held: ${ent.heldItem?.name || 'none'})` : 'far/offline'}`);
  }
}
