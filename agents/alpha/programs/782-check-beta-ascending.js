// programs/782-check-beta-ascending.js
console.log('=== Program 782: Check Beta Ascent & Sill ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

const beta = bot.players['beta']?.entity;
console.log(`Beta at: ${beta ? lib.fmt(beta.position) : 'in shaft'}, held: ${beta?.heldItem?.name}`);

const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Sill: ${sill?.name}`);

const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
console.log(`Active portals: ${portals.length}`);

return {
  betaPos: beta ? lib.fmt(beta.position) : null,
  betaHeld: beta?.heldItem?.name || null,
  sill: sill?.name,
  portals: portals.length
};
