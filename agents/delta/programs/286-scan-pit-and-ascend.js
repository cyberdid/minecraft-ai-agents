// programs/286-scan-pit-and-ascend.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// Scan vertical column above player
for (let y = bot.entity.position.floored().y; y <= 75; y++) {
  const b = bot.blockAt(new Vec3(bot.entity.position.x, y, bot.entity.position.z).floored());
  console.log(`y=${y}: ${b?.name}`);
}

// Find closest air blocks at y=72 (surface)
const surfaceAir = bot.findBlocks({
  matching: b => b.name === 'air',
  maxDistance: 32,
  count: 10,
  point: new Vec3(bot.entity.position.x, 72, bot.entity.position.z)
});
console.log(`Found ${surfaceAir.length} air blocks near y=72`);
if (surfaceAir.length > 0) {
  console.log('Nearest surface air:', lib.fmt(surfaceAir[0]));
}

// Check blocks immediately around Delta at y=53..55
for (let dx = -1; dx <= 1; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    for (let dy = 0; dy <= 2; dy++) {
      const p = bot.entity.position.offset(dx, dy, dz).floored();
      const b = bot.blockAt(p);
      console.log(`(${p.x}, ${p.y}, ${p.z}): ${b?.name}`);
    }
  }
}
