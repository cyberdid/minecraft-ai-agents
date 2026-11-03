// programs/564-check-beta-and-portal.js
console.log('=== CHECK PORTAL & PLAYERS ===');
const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log('Portal sill (299, 72, -54):', sill ? sill.name : 'null');
const p1 = bot.blockAt(new Vec3(299, 73, -54));
console.log('Portal block (299, 73, -54):', p1 ? p1.name : 'null');

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
bot.chat('gamma: Beta/Alpha/Delta: Who has flint_and_steel or iron_ingot? Gravel vein is at (290, 66, -66).');
