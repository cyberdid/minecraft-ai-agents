// programs/419-inspect-surroundings.js
const p = bot.entity.position;
console.log('Bot pos:', lib.fmt(p));

console.log('Surrounding blocks:');
for (let dy = 2; dy >= -1; dy--) {
  let line = `y=${Math.floor(p.y) + dy}: `;
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      const b = bot.blockAt(p.offset(dx, dy, dz));
      if (b && b.name !== 'air') {
        line += `(${dx},${dz}:${b.name}) `;
      }
    }
  }
  console.log(line);
}
