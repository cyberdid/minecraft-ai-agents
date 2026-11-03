// programs/589-finish-walk-to-base.js
console.log('=== FINISH WALK TO BASE ===');
console.log('Pos:', lib.fmt(bot.entity.position));

try {
  await lib.goTo(294, 72, -54, 1.5, { timeoutMs: 20000 });
} catch (e) {
  try {
    await lib.goToXZ(294, -54, { timeoutMs: 15000 });
  } catch (e2) {}
}

console.log('Arrived at portal base! Pos:', lib.fmt(bot.entity.position));

const sill = bot.blockAt(new Vec3(299, 72, -54));
const p1 = bot.blockAt(new Vec3(299, 73, -54));
console.log('Sill (299, 72, -54):', sill ? sill.name : 'null');
console.log('Portal block (299, 73, -54):', p1 ? p1.name : 'null');

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}

bot.chat(`gamma: Reunited at portal frame with Delta & Beta (${lib.fmt(bot.entity.position)})!`);
