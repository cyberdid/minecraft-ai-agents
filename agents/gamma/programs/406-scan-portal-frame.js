// programs/406-scan-portal-frame.js
console.log('=== SCAN PORTAL FRAME EXACT BLOCKS ===');
console.log('Bot pos:', lib.fmt(bot.entity.position));

const blocks = [];
for (let y = 72; y <= 76; y++) {
  for (let z = -56; z <= -51; z++) {
    for (let x = 296; x <= 301; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air') {
        blocks.push(`(${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}

console.log('Found blocks:\n' + blocks.join('\n'));

// Find exact nether_portal blocks
const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 8,
  count: 20
});
console.log('Active nether_portal blocks:', portals.map(p => lib.fmt(p)));

return { portals: portals.map(p => ({ x: p.x, y: p.y, z: p.z })) };
