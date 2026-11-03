console.log('=== Program 906: Check Delta Portal at (46, 66, 2) ===');
console.log('Beta pos:', lib.fmt(bot.entity.position));

const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 24,
  count: 10
});
console.log(`Portals within 24m: ${portals.length}`);
for (const p of portals) {
  console.log(`  portal at ${lib.fmt(p)}`);
}

for (const p of Object.values(bot.players)) {
  if (p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}, dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}`);
  }
}
