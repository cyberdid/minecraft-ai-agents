// programs/185-inspect-lava-pool-geometry.js
console.log('Pos:', lib.fmt(bot.entity.position));

const lavaPos = new Vec3(333, 62, -78);
console.log(`Lava block at ${lib.fmt(lavaPos)}:`, bot.blockAt(lavaPos)?.name, 'metadata:', bot.blockAt(lavaPos)?.metadata);
console.log(`Above lava at y=63:`, bot.blockAt(lavaPos.offset(0, 1, 0))?.name);

for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  const nb = bot.blockAt(lavaPos.offset(dx, 0, dz));
  const nbUp = bot.blockAt(lavaPos.offset(dx, 1, dz));
  console.log(`Neighbor (${dx}, ${dz}): y=62 is ${nb?.name} (${nb?.boundingBox}), y=63 is ${nbUp?.name}`);
}

// Find all lava sources within 16 blocks
const allLava = bot.findBlocks({ matching: b => b.name === 'lava' && b.metadata === 0, maxDistance: 16 });
console.log(`Found ${allLava.length} lava source blocks within 16 blocks:`);
for (const p of allLava) {
  console.log(`  Source at ${lib.fmt(p)}, up=${bot.blockAt(p.offset(0, 1, 0))?.name}`);
}
