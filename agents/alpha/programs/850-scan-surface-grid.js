// programs/850-scan-surface-grid.js
console.log('=== Program 850: Scan Surface Grid ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

// Check blocks at y=31..34 for various x, z
for (let dx = -10; dx <= 10; dx += 2) {
  const x = Math.floor(bot.entity.position.x) + dx;
  const line = [];
  for (let dz = -10; dz <= 10; dz += 2) {
    const z = Math.floor(bot.entity.position.z) + dz;
    const b31 = bot.blockAt(new Vec3(x, 31, z))?.name || 'none';
    const b32 = bot.blockAt(new Vec3(x, 32, z))?.name || 'none';
    const b34 = bot.blockAt(new Vec3(x, 34, z))?.name || 'none';
    line.push(`(${dx},${dz}):y31=${b31},y34=${b34}`);
  }
  console.log(`dx=${dx}: ${line.slice(0, 5).join(' | ')}`);
}
