// programs/827-scan-pillar-blocks.js
console.log('=== Scan Solid Blocks ===');
console.log('Bot pos:', lib.fmt(bot.entity.position));

const blocks = bot.findBlocks({
  matching: b => b && b.name !== 'lava' && b.name !== 'air' && b.name !== 'cave_air',
  maxDistance: 8,
  count: 30
});

console.log(`Found ${blocks.length} solid blocks within 8m:`);
for (const bPos of blocks.slice(0, 15)) {
  const b = bot.blockAt(bPos);
  console.log(`  (${bPos.x}, ${bPos.y}, ${bPos.z}): ${b.name}`);
}

// Find highest solid block among them
let highest = null;
for (const bPos of blocks) {
  if (!highest || bPos.y > highest.y) {
    highest = bPos;
  }
}
if (highest) {
  console.log(`Highest solid block: (${highest.x}, ${highest.y}, ${highest.z}) is ${bot.blockAt(highest)?.name}`);
}
