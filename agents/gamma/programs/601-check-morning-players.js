// programs/601-check-morning-players.js
console.log('=== MORNING TEAM & PORTAL STATUS ===');
console.log('Time:', bot.time.timeOfDay);

const sill = bot.blockAt(new Vec3(299, 72, -54));
const p1 = bot.blockAt(new Vec3(299, 73, -54));
console.log('Sill (299, 72, -54):', sill ? sill.name : 'null');
console.log('Portal (299, 73, -54):', p1 ? p1.name : 'null');

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
bot.chat('gamma: Morning! Night skipped. Team status update — Beta/Alpha/Delta?');
