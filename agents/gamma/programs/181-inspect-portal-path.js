// programs/181-inspect-portal-path.js
console.log('--- INSPECT BLOCKS ALONG PATH TO PORTAL ---');
console.log('Bot pos:', bot.entity.position);

// Check blocks along line x=294..300, y=71..74, z=-54..-53
for (let x = 294; x <= 300; x++) {
  const col = [];
  for (let y = 71; y <= 74; y++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    col.push(`y=${y}:${b?.name}`);
  }
  console.log(`x=${x}, z=-54: ${col.join(', ')}`);
}

// Find all nether_portal blocks within 12 blocks
const portals = bot.findBlocks({
  matching: b => b.name === 'nether_portal',
  maxDistance: 16,
  count: 10
});
console.log(`Found ${portals.length} nether_portal blocks:`, portals.map(p => lib.fmt(p)));
