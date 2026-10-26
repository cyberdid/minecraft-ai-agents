// programs/430-map-fortress-and-spawner-path.js
console.log('=== Program 430: Map Fortress Structure & Blaze Spawner Path ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

// 1. Scan for spawners within 64 blocks
const spawners = bot.findBlocks({
  matching: b => b.name === 'spawner',
  maxDistance: 64,
  count: 5
});
console.log(`Spawners found within 64m: ${spawners.length}`);
for (const s of spawners) {
  const dist = bot.entity.position.distanceTo(s);
  console.log(`>>> SPAWNER at ${lib.fmt(s)} (distance: ${dist.toFixed(1)}m) <<<`);
}

// 2. Scan for nether_bricks (fortress walkways and corridors)
const netherBricks = bot.findBlocks({
  matching: b => ['nether_bricks', 'nether_brick_fence', 'nether_brick_stairs'].includes(b.name),
  maxDistance: 64,
  count: 20
});
console.log(`Fortress nether_brick blocks detected: ${netherBricks.length}`);
// Group by elevation Y and sector Z
const clusters = {};
for (const nb of netherBricks) {
  const key = `y=${nb.y}, z=${Math.floor(nb.z / 10) * 10}`;
  clusters[key] = (clusters[key] || 0) + 1;
}
console.log('Fortress brick clusters:', JSON.stringify(clusters));
for (const nb of netherBricks.slice(0, 8)) {
  console.log(`- Brick at ${lib.fmt(nb)} (dist: ${bot.entity.position.distanceTo(nb).toFixed(1)}m)`);
}

// 3. Scan for solid blocks along the path towards x=32, z=-150..-190
console.log('--- Scanning terrain towards target (32, 68, -190) ---');
for (let targetZ = -140; targetZ >= -170; targetZ -= 5) {
  // Check cross-section from x=32 to x=44 at y=64..68
  const solid = [];
  for (let x = 32; x <= 44; x++) {
    for (let y = 63; y <= 69; y++) {
      const b = bot.blockAt(new Vec3(x, y, targetZ));
      if (b && b.name !== 'air' && b.name !== 'cave_air' && b.name !== 'lava') {
        solid.push(`(${x},${y})=${b.name}`);
      }
    }
  }
  console.log(`Cross-section at z=${targetZ}: ${solid.length > 0 ? solid.slice(0, 4).join(', ') : 'open air'}`);
}

// 4. Report map summary
bot.chat(`team: Alpha mapped fortress! Spawners detected: ${spawners.length}. Target spawner at (32, 68, -190).`);
console.log('Alpha status:', JSON.stringify(lib.status()));
