// programs/218-check-team-and-spawner.js
console.log('--- CHECK TEAM AND SPAWNER STATUS AT Z=-178 ---');
console.log('Gamma pos:', lib.fmt(bot.entity.position));
console.log('Distance to Blaze Spawner (32, 68, -190):', bot.entity.position.distanceTo(new Vec3(32, 68, -190)).toFixed(1));

// Check teammates
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username) {
    const ent = p.entity;
    console.log(`Teammate ${p.username}: ${ent ? `${lib.fmt(ent.position)} (dist: ${bot.entity.position.distanceTo(ent.position).toFixed(1)}m, held: ${ent.heldItem?.name || 'none'})` : 'offline/far'}`);
  }
}

// Check hostiles
const hostiles = lib.hostiles(24);
console.log(`Hostiles within 24m (${hostiles.length}):`, JSON.stringify(hostiles));

// Check dropped items nearby
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 24);
console.log(`Dropped items within 24m (${items.length}):`, items.map(i => `${lib.fmt(i.position)} (dist: ${bot.entity.position.distanceTo(i.position).toFixed(1)}m)`));

bot.chat('team: gamma at (44, 65, -178)! Only 10m to spawner platform! Delta/Alpha bring cobble to finish bridge!');
