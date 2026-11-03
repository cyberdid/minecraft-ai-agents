// programs/610-inspect-and-secure-at-y26.js
console.log('=== Program 610: Inspect & Secure at y=26 ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', lib.inv());

// Check surrounding blocks
const pos = bot.entity.position.floored();
console.log(`Standing on block at ${lib.fmt(pos.offset(0, -1, 0))}: ${bot.blockAt(pos.offset(0, -1, 0))?.name}`);

// Check 4 horizontal neighbors at eye level and foot level
const dirs = [
  { name: 'North', vec: new Vec3(0, 0, -1) },
  { name: 'South', vec: new Vec3(0, 0, 1) },
  { name: 'West', vec: new Vec3(-1, 0, 0) },
  { name: 'East', vec: new Vec3(1, 0, 0) }
];

for (const d of dirs) {
  const foot = bot.blockAt(pos.plus(d.vec));
  const head = bot.blockAt(pos.plus(d.vec).offset(0, 1, 0));
  console.log(`${d.name}: foot=${foot?.name}, head=${head?.name}`);
}

// Check nearby nether_brick blocks (fortress pillars)
const pillars = bot.findBlocks({
  matching: b => b.name.includes('nether_brick'),
  maxDistance: 12,
  count: 20
});
console.log(`Found ${pillars.length} nether_brick blocks nearby (pillar base)`);

// Place a roof above head if open to sky to block any fireballs from above
const roofPos = pos.offset(0, 2, 0);
const roofBlock = bot.blockAt(roofPos);
if (roofBlock && roofBlock.name === 'air' && lib.count('cobblestone') > 0) {
  console.log(`Placing protective roof block at ${lib.fmt(roofPos)}...`);
  try {
    // find a solid neighbor for placing roof
    await lib.place('cobblestone', roofPos.x, roofPos.y, roofPos.z);
    console.log('Roof placed!');
  } catch (e) {
    console.log('Roof placement note:', e.message);
  }
}

// Check hostiles
const hostiles = lib.hostiles(20);
console.log('Hostiles within 20m:', hostiles.map(h => `${h.name} (${h.dist.toFixed(1)}m)`).join(', ') || 'none');
