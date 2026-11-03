// programs/602-inspect-portal-blocks.js
console.log('=== Program 602: Inspect Portal Blocks ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

const portals = bot.findBlocks({
  matching: b => b.name === 'nether_portal',
  maxDistance: 8,
  count: 10
});

console.log(`Found ${portals.length} nether_portal blocks:`);
for (const p of portals) {
  console.log(`- portal block at ${lib.fmt(p)}`);
}

const obsidians = bot.findBlocks({
  matching: b => b.name === 'obsidian',
  maxDistance: 8,
  count: 20
});
console.log(`Found ${obsidians.length} obsidian blocks within 8m`);
