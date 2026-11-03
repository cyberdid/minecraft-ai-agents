// programs/768-check-chat-and-state.js
console.log('=== Program 768: Check Chat & State ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

// Print players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== bot.username) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} holding: ${p.entity.heldItem?.name}`);
  }
}

// Check portal sill
const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Portal sill block: ${sill?.name}`);

const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
console.log(`Active portals: ${portals.length}`);

return { sill: sill?.name, portals: portals.length };
