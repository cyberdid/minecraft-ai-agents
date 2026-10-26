// programs/359-inspect-at-y28.js
console.log('=== Inspect above y=28 ===');
const p = bot.entity.position.floored();

for (let y = 28; y <= 35; y++) {
  let line = `y=${y}: `;
  for (let dz = -3; dz <= 3; dz++) {
    for (let dx = -3; dx <= 3; dx++) {
      const b = bot.blockAt(new Vec3(p.x + dx, y, p.z + dz));
      if (b && (b.name === 'air' || b.name === 'cave_air' || b.name === 'ladder')) {
        line += `(${p.x + dx},${p.z + dz}) `;
      }
    }
  }
  console.log(line);
}
