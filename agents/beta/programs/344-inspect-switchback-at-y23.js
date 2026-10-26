// programs/344-inspect-switchback-at-y23.js
console.log('=== Inspect switchback at (303, 23, -45) ===');
const p = new Vec3(303, 23, -45);

for (let dy = 0; dy <= 4; dy++) {
  let line = `y=${p.y + dy}: `;
  for (let dz = -4; dz <= 4; dz++) {
    for (let dx = -2; dx <= 2; dx++) {
      const b = bot.blockAt(new Vec3(p.x + dx, p.y + dy, p.z + dz));
      if (b && (b.name === 'air' || b.name === 'cave_air' || b.name === 'ladder')) {
        line += `(${p.x + dx},${p.z + dz}) `;
      }
    }
  }
  console.log(line);
}
