// programs/742-inspect-portal-frame.js
console.log('=== Program 742: Inspect Portal Frame Blocks ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

for (let x = 298; x <= 301; x++) {
  for (let y = 72; y <= 75; y++) {
    for (let z = -56; z <= -52; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air') {
        console.log(`Block at (${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}

// Find nether_portal blocks specifically
const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 6,
  count: 10
});

console.log(`Found ${portals.length} nether_portal blocks within 6m:`);
for (const p of portals) {
  console.log(` - nether_portal at ${lib.fmt(p)}`);
}

return { portals: portals.map(p => lib.fmt(p)) };
