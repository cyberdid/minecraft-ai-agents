// programs/342-inspect-from-y21.js
console.log('=== Inspect from y=21 ===');
const p = bot.entity.position.floored();
console.log('Floored pos:', p);

for (let y = 21; y <= 32; y++) {
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
