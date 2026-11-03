// programs/893-inspect-nether-portal-frame.js
console.log('=== Program 893: Inspect Nether Portal Frame in the_nether ===');
const p = bot.entity.position;
console.log(`Beta pos: ${lib.fmt(p)}`);

// Search for any nether_portal block within 8m
const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 8,
  count: 10
});

console.log(`Found ${portals.length} nether_portal blocks:`);
for (const pb of portals) {
  console.log(`  Portal block at ${lib.fmt(pb)} (dist: ${p.distanceTo(pb).toFixed(2)}m)`);
}

// Search for obsidian blocks within 8m
const obs = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  maxDistance: 8,
  count: 20
});
console.log(`Found ${obs.length} obsidian blocks:`, obs.map(o => lib.fmt(o)));
