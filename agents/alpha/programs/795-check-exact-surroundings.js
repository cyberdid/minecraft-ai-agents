// programs/795-check-exact-surroundings.js
const p = bot.entity.position;
console.log('Pos:', p);

for (let dy = -2; dy <= 2; dy++) {
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      const b = bot.blockAt(p.offset(dx, dy, dz));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        console.log(`Block at offset (${dx}, ${dy}, ${dz}): ${b.name} at ${lib.fmt(b.position)}`);
      }
    }
  }
}
