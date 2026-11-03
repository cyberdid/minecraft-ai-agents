// programs/427-inspect-portal-entry.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// Find nether_portal blocks
const portalId = mcData.blocksByName.nether_portal?.id;
const portals = bot.findBlocks({ matching: portalId, maxDistance: 10, count: 10 });
console.log(`Found ${portals.length} nether_portal blocks:`);
for (const p of portals) {
  console.log(`  nether_portal at ${lib.fmt(p)}`);
}

// Find obsidian blocks
const obsId = mcData.blocksByName.obsidian?.id;
const obsidian = bot.findBlocks({ matching: obsId, maxDistance: 10, count: 16 });
console.log(`Found ${obsidian.length} obsidian blocks:`);
for (const o of obsidian) {
  console.log(`  obsidian at ${lib.fmt(o)}`);
}
