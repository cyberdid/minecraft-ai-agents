// programs/089-inspect-surroundings.js
console.log('--- INSPECTING POSITION & SURROUNDING BLOCKS ---');
const p = bot.entity.position;
console.log('Exact pos:', p.x, p.y, p.z);

for (let dy = -1; dy <= 2; dy++) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const pos = p.floored().offset(dx, dy, dz);
      const b = bot.blockAt(pos);
      console.log(`[${dx}, ${dy}, ${dz}] at ${lib.fmt(pos)}: ${b ? b.name : 'null'} (solid=${b ? b.boundingBox : 'none'})`);
    }
  }
}
