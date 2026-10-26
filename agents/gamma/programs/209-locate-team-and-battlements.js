// programs/209-locate-team-and-battlements.js
console.log('--- LOCATE TEAMMATES AND BATTLEMENTS BOX ---');
console.log('Gamma pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// Check all teammates
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username) {
    const ent = p.entity;
    console.log(`Teammate ${p.username}: ${ent ? `${lib.fmt(ent.position)} (dist: ${bot.entity.position.distanceTo(ent.position).toFixed(1)}m, HP: ${ent.health || '?'})` : 'offline/far'}`);
  }
}

// Check battlements box at (44, 65, -159..-161)
console.log('Checking battlements box at (44, 64..67, -159..-161):');
for (let z = -158; z >= -162; z--) {
  const f = bot.blockAt(new Vec3(44, 64, z));
  const feet = bot.blockAt(new Vec3(44, 65, z));
  const head = bot.blockAt(new Vec3(44, 66, z));
  const roof = bot.blockAt(new Vec3(44, 67, z));
  console.log(`z=${z}: flr=${f?.name || 'air'} | feet=${feet?.name || 'air'} | head=${head?.name || 'air'} | roof=${roof?.name || 'air'}`);
}

// Scan hostiles within 32m
const hostiles = lib.hostiles(32);
console.log(`Hostiles within 32m (${hostiles.length}):`, JSON.stringify(hostiles));

// Scan dropped items within 32m
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 32);
console.log(`Dropped items within 32m (${items.length}):`, items.map(i => `${lib.fmt(i.position)} (dist: ${bot.entity.position.distanceTo(i.position).toFixed(1)}m)`));
