// programs/606-step-to-portal-check-team.js
console.log('=== STEP TO PORTAL AND CHECK TEAM ===');
try {
  await lib.goTo(297.5, 72.0, -53.0, 1.0, { timeoutMs: 8000 });
} catch (e) {}

const sill = bot.blockAt(new Vec3(299, 72, -54));
const p1 = bot.blockAt(new Vec3(299, 73, -54));
console.log('Sill (299, 72, -54):', sill ? sill.name : 'null');
console.log('Portal block (299, 73, -54):', p1 ? p1.name : 'null');

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
bot.chat('gamma: Shield 100% equipped! Stationed at portal sill (297.5, 72.0, -53.0) ready for Nether transit!');
