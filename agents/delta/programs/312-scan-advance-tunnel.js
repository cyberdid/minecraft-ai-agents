// programs/312-scan-advance-tunnel.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

for (let z = -158; z >= -175; z--) {
  const bFloor = bot.blockAt(new Vec3(44, 64, z));
  const bAt = bot.blockAt(new Vec3(44, 65, z));
  const bHead = bot.blockAt(new Vec3(44, 66, z));
  const bRoof = bot.blockAt(new Vec3(44, 67, z));
  const bWest = bot.blockAt(new Vec3(43, 65, z));
  console.log(`z=${z}: floor=${bFloor?.name || 'AIR'} | at=${bAt?.name || 'AIR'} | head=${bHead?.name || 'AIR'} | roof=${bRoof?.name || 'AIR'} | westWall=${bWest?.name || 'OPEN'}`);
}

// Check nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist: ${dist.toFixed(1)}m, HP: ${p.entity.metadata?.[9] ?? '?'})`);
  }
}

// Check nearby hostiles (Blazes, Wither Skeletons)
for (const e of Object.values(bot.entities)) {
  if (e && e !== bot.entity && (e.name === 'blaze' || e.name === 'wither_skeleton' || e.type === 'hostile')) {
    const dist = bot.entity.position.distanceTo(e.position);
    if (dist < 35) {
      console.log(`Hostile ${e.name} at ${lib.fmt(e.position)} (dist: ${dist.toFixed(1)}m)`);
    }
  }
}
