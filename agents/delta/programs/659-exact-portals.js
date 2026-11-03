console.log('=== EXACT PORTALS AT (46, 66, 2) ===');
const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  point: new Vec3(46, 66, 2),
  maxDistance: 8,
  count: 10
});

for (const p of portals) {
  console.log(`Portal block: ${lib.fmt(p)}`);
}
