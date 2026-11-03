// programs/819-inspect-surroundings.js
const p = bot.entity.position;
const bx = Math.floor(p.x);
const by = Math.floor(p.y);
const bz = Math.floor(p.z);
console.log(`Bot pos: ${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`);

for (let dy = -1; dy <= 2; dy++) {
  const layer = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      const b = bot.blockAt(new Vec3(bx + dx, by + dy, bz + dz));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        layer.push(`${dx},${dz}:${b.name}`);
      }
    }
  }
  console.log(`dy=${dy}: ${layer.join(' ')}`);
}
