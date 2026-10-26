// programs/034-check-portal-foundation.js
const b299 = bot.blockAt(new Vec3(299, 71, -54));
const b300 = bot.blockAt(new Vec3(300, 71, -54));
console.log('Foundation under bottom obsidian:');
console.log('  (299, 71, -54):', b299 ? b299.name : 'null');
console.log('  (300, 71, -54):', b300 ? b300.name : 'null');

if (b299 && b299.boundingBox !== 'block') {
  console.log('Placing solid dirt/cobble foundation at (299, 71, -54)...');
  await lib.place('cobblestone', 299, 71, -54);
}
if (b300 && b300.boundingBox !== 'block') {
  console.log('Placing solid dirt/cobble foundation at (300, 71, -54)...');
  await lib.place('cobblestone', 300, 71, -54);
}

// Check players
for (const p of Object.values(bot.players)) {
  if (p.username !== 'gamma' && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}
