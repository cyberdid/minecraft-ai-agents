console.log('=== INSPECT PORTAL AT (46, 66, 2) ===');
console.log(`Delta Pos: ${lib.fmt(bot.entity.position)}`);

// Look for obsidian near (46, 66, 2)
const obsidians = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  point: new Vec3(46, 66, 2),
  maxDistance: 12,
  count: 30
});
console.log(`Obsidians near (46, 66, 2): ${obsidians.length}`);
for (const o of obsidians) {
  console.log(`  Obsidian at ${lib.fmt(o)}`);
}

// Look for portals near (46, 66, 2)
const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  point: new Vec3(46, 66, 2),
  maxDistance: 12,
  count: 10
});
console.log(`Portals near (46, 66, 2): ${portals.length}`);

// Gamma position
const gamma = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'gamma');
if (gamma) {
  console.log(`Gamma at ${lib.fmt(gamma.position)}`);
}
