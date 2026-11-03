console.log('=== FIND EXACT PORTAL COORDINATES ===');
const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 48, count: 20 });
console.log(`Portals within 48m: ${portals.length}`);
for (const p of portals) {
  console.log(`  Portal at ${lib.fmt(p)}`);
}

const obsidians = bot.findBlocks({ matching: b => b && b.name === 'obsidian', maxDistance: 48, count: 30 });
console.log(`Obsidian blocks within 48m: ${obsidians.length}`);
for (const o of obsidians) {
  console.log(`  Obsidian at ${lib.fmt(o)}`);
}
