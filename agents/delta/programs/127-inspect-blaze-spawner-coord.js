// programs/127-inspect-blaze-spawner-coord.js
console.log('Pos:', lib.fmt(bot.entity.position));

// Inspect column (32, y, -190) and (32, y, -189..-191)
console.log('Inspecting (32, y, -190):');
let spawnerFound = null;
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    const x = 32 + dx;
    const z = -190 + dz;
    for (let y = 50; y <= 75; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name === 'spawner') {
        spawnerFound = { x, y, z, name: b.name };
        console.log(`SPAWNER BLOCK AT (${x}, ${y}, ${z})!`);
      }
    }
  }
}

if (!spawnerFound) {
  console.log('Spawner block not in currently loaded chunks or not at (30..34, 50..75, -188..-192).');
  // Check column (32, y, -190)
  for (let y = 50; y <= 75; y++) {
    const b = bot.blockAt(new Vec3(32, y, -190));
    if (b && b.name !== 'air' && b.name !== 'cave_air') {
      console.log(`(32, ${y}, -190): ${b.name}`);
    }
  }
}
