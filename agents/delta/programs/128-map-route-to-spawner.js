// programs/128-map-route-to-spawner.js
console.log('Pos:', lib.fmt(bot.entity.position));

// Check blocks along line from (45, 65, -134) to (32, 68, -190)
console.log('--- Mapping pathway to Blaze Spawner at (32, 68, -190) ---');

for (let z = -134; z >= -190; z -= 4) {
  // Linear interpolation of X from 45 at z=-134 down to 32 at z=-190
  const progress = (-134 - z) / (-134 - -190);
  const targetX = Math.round(45 + progress * (32 - 45));
  
  // Find solid floor between y=50 and y=75
  const solidLayers = [];
  for (let y = 50; y <= 75; y++) {
    const b = bot.blockAt(new Vec3(targetX, y, z));
    if (b && b.name !== 'air' && b.name !== 'cave_air') {
      solidLayers.push(`${y}:${b.name}`);
    }
  }
  console.log(`z=${z} (x=${targetX}): solid at [${solidLayers.join(', ')}]`);
}
