// programs/442-inspect-portal-blocks.js
console.log('=== INSPECT PORTAL BLOCKS ===');
console.log('Gamma pos:', lib.fmt(bot.entity.position));

for (let y = 72; y <= 75; y++) {
  for (let z = -55; z <= -51; z++) {
    for (let x = 298; x <= 301; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air') {
        console.log(`(${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}

// Find all nether_portal blocks
const portals = bot.findBlocks({ matching: mcData.blocksByName.nether_portal.id, maxDistance: 10 });
console.log('Portal blocks found:', portals.length);
for (const p of portals) {
  console.log('Portal block at:', lib.fmt(p));
}
