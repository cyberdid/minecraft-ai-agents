// programs/866-check-portal-now.js
console.log('=== Program 866: Check Portal Frame Status ===');

const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Portal sill at (299, 72, -54): ${sill ? sill.name : 'null'}`);

const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
console.log(`Active nether_portal blocks: ${portals.length}`);

for (const [name, pl] of Object.entries(bot.players)) {
  if (pl && pl.entity) {
    console.log(`Player ${name} at ${lib.fmt(pl.entity.position)} held: ${pl.entity.heldItem ? pl.entity.heldItem.name : 'empty'}`);
  }
}
