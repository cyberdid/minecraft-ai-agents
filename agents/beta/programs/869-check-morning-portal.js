// programs/869-check-morning-portal.js
console.log('=== Program 869: Check Morning Portal & Team Status ===');

// Step outside base
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(296, 72, -53, 1.2, { timeoutMs: 4000 }); } catch (e2) {}
}

const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Portal sill at (299, 72, -54): ${sill ? sill.name : 'null'}`);

const obsAt297 = bot.blockAt(new Vec3(297, 73, -53));
console.log(`Obsidian at (297, 73, -53): ${obsAt297 ? obsAt297.name : 'null'}`);

const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
console.log(`Active nether_portal blocks: ${portals.length}`);

for (const [name, pl] of Object.entries(bot.players)) {
  if (pl && pl.entity) {
    console.log(`Player ${name} at ${lib.fmt(pl.entity.position)} held: ${pl.entity.heldItem ? pl.entity.heldItem.name : 'empty'}`);
  }
}
