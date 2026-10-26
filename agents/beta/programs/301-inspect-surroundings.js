// programs/301-inspect-surroundings.js
console.log('=== Inspect surroundings around beta at y=48 ===');
const p = bot.entity.position.floored();
console.log('Beta exact pos:', bot.entity.position);

for (let dy = 2; dy >= -1; dy--) {
  let line = `y=${p.y + dy}: `;
  for (let dz = -2; dz <= 2; dz++) {
    for (let dx = -2; dx <= 2; dx++) {
      const b = bot.blockAt(p.offset(dx, dy, dz));
      const name = b ? b.name : 'null';
      if (dx === 0 && dz === 0) {
        line += `[ME:${name}] `;
      } else if (name !== 'air' && name !== 'cave_air') {
        line += `(${dx},${dz}:${name}) `;
      }
    }
  }
  console.log(line);
}

// Check nearby players / entities
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (e && e.type === 'player' && e.username !== bot.username) {
    console.log(`Player ${e.username} at ${lib.fmt(e.position)}`);
  }
}
