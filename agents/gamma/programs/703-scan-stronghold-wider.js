// programs/703-scan-stronghold-wider.js
const frames = bot.findBlocks({
  matching: b => b && (b.name === 'end_portal_frame' || b.name === 'end_portal'),
  maxDistance: 64,
  count: 32
});

console.log(`Found ${frames.length} end portal frames within 64m:`);
for (const p of frames) {
  const b = bot.blockAt(p);
  console.log(`Frame at ${lib.fmt(p)}, eye=${b?._properties?.eye}`);
}

// Also check blocks in 5x5 around spawner at (2229, 12, 1457)
console.log('Inspecting around spawner (2229, 12, 1457):');
for (let dy = -3; dy <= 5; dy++) {
  const y = 12 + dy;
  for (let dx = -3; dx <= 3; dx++) {
    for (let dz = -3; dz <= 3; dz++) {
      const p = new Vec3(2229 + dx, y, 1457 + dz);
      const b = bot.blockAt(p);
      if (b && b.name !== 'stone' && b.name !== 'deepslate' && b.name !== 'air' && b.name !== 'cave_air') {
        console.log(`(${p.x}, ${p.y}, ${p.z}): ${b.name}`);
      }
    }
  }
}

return { frames: frames.length };
