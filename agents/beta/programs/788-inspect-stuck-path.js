// programs/788-inspect-stuck-path.js
console.log('=== Program 788: Inspect Stuck Path ===');
const pos = bot.entity.position;
console.log('Pos:', lib.fmt(pos));

// Check blocks around bot (-2 to +2 in X and Y, -34 to -20 in Z)
for (let dz = 0; dz >= -5; dz--) {
  const z = Math.floor(pos.z) + dz;
  const line = [];
  for (let dx = -1; dx <= 1; dx++) {
    const x = Math.floor(pos.x) + dx;
    const b0 = bot.blockAt(new Vec3(x, Math.floor(pos.y) - 1, z))?.name || 'none';
    const b1 = bot.blockAt(new Vec3(x, Math.floor(pos.y), z))?.name || 'none';
    const b2 = bot.blockAt(new Vec3(x, Math.floor(pos.y) + 1, z))?.name || 'none';
    line.push(`(${dx}): [floor:${b0}, body:${b1}, head:${b2}]`);
  }
  console.log(`z=${z}: ${line.join(' | ')}`);
}

// Also check towards positive Z (going towards -20 is +Z from -33.5!)
console.log('--- Checking towards +Z (towards portal) ---');
for (let dz = 0; dz <= 6; dz++) {
  const z = Math.floor(pos.z) + dz;
  const line = [];
  for (let dx = -1; dx <= 1; dx++) {
    const x = Math.floor(pos.x) + dx;
    const b0 = bot.blockAt(new Vec3(x, Math.floor(pos.y) - 1, z))?.name || 'none';
    const b1 = bot.blockAt(new Vec3(x, Math.floor(pos.y), z))?.name || 'none';
    const b2 = bot.blockAt(new Vec3(x, Math.floor(pos.y) + 1, z))?.name || 'none';
    line.push(`(${dx}): [floor:${b0}, body:${b1}, head:${b2}]`);
  }
  console.log(`z=${z}: ${line.join(' | ')}`);
}
