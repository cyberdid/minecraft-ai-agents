// programs/480-scan-staircase.js
console.log('=== Step: Scan Tunnel & Staircase ===');
console.log('Pos:', lib.fmt(bot.entity.position));

// Scan for air or torches in a 10-block radius above us (y=46..55)
const torches = bot.findBlocks({
  matching: b => b.name.includes('torch'),
  maxDistance: 15,
  count: 10
});
console.log(`Torches nearby (${torches.length}):`);
for (const t of torches) {
  console.log(`  Torch at ${lib.fmt(t)} (dist ${bot.entity.position.distanceTo(t).toFixed(1)}m)`);
}

// Find open walkable blocks going up
console.log('Adjacent blocks:');
for (let dx = -1; dx <= 1; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    for (let dy = -1; dy <= 2; dy++) {
      const p = bot.entity.position.floored().offset(dx, dy, dz);
      const b = bot.blockAt(p);
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        console.log(`  Block at ${p.x},${p.y},${p.z}: ${b.name}`);
      }
    }
  }
}
