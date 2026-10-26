// programs/485-scan-spawner-architecture.js
console.log('=== Program 485: Scan Spawner Architecture & Entities ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Scan for spawner block (mob_spawner)
const spawnerBlocks = bot.findBlocks({
  matching: b => b.name === 'spawner',
  maxDistance: 48,
  count: 5
});
console.log(`Found ${spawnerBlocks.length} spawner blocks:`, spawnerBlocks.map(p => lib.fmt(p)).join(', '));

// 2. Scan for nether_brick blocks near z=-163..-195
const fortressBlocks = bot.findBlocks({
  matching: b => b.name.includes('nether_brick'),
  maxDistance: 48,
  count: 100
});
console.log(`Found ${fortressBlocks.length} fortress blocks near Alpha`);
if (fortressBlocks.length > 0) {
  const yLevels = {};
  for (const p of fortressBlocks) {
    yLevels[p.y] = (yLevels[p.y] || 0) + 1;
  }
  console.log('Fortress blocks by Y-level:', JSON.stringify(yLevels));
  
  // Find closest fortress walkway block
  const closest = fortressBlocks.sort((a, b) => a.distanceTo(bot.entity.position) - b.distanceTo(bot.entity.position))[0];
  console.log(`Closest fortress block at: ${lib.fmt(closest)} (dist ${closest.distanceTo(bot.entity.position).toFixed(1)}m)`);
}

// 3. Scan for solid blocks between current pos (44, 65, -163) and (32, 68, -190)
const lineSolids = [];
for (let z = -163; z >= -192; z--) {
  for (let x = 30; x <= 45; x++) {
    for (let y = 63; y <= 69; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air' && b.name !== 'lava') {
        lineSolids.push({ x, y, z, name: b.name });
      }
    }
  }
}
console.log(`Total solid blocks in corridor (x: 30..45, y: 63..69, z: -163..-192): ${lineSolids.length}`);

// 4. Check all entities (Blazes, Wither Skeletons, teammates)
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

const mobs = Object.values(bot.entities).filter(e => ['blaze', 'wither_skeleton', 'piglin', 'zombified_piglin', 'magma_cube'].includes(e.name));
console.log(`Nearby Nether mobs (${mobs.length}):`);
for (const m of mobs) {
  const d = m.position.distanceTo(bot.entity.position);
  console.log(`- ${m.name} at ${lib.fmt(m.position)} (dist ${d.toFixed(1)}m)`);
}
