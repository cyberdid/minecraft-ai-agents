// programs/830-check-team-and-portal.js
console.log('=== Program 830: Check Team & Portal Frame ===');
const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Portal sill (299, 72, -54): ${sill ? sill.name : 'null'}`);

const activePortals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
console.log(`Active nether_portal blocks: ${activePortals.length}`);

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== bot.username) {
    const dist = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (${dist}m), holding: ${p.entity.heldItem?.name}`);
  }
}
