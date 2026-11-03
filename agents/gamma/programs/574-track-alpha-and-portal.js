// programs/574-track-alpha-and-portal.js
console.log('=== TRACK ALPHA & PORTAL ===');
const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log('Portal sill (299, 72, -54):', sill ? sill.name : 'null');
const p1 = bot.blockAt(new Vec3(299, 73, -54));
console.log('Portal block (299, 73, -54):', p1 ? p1.name : 'null');

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
