// programs/340-inspect-stairs.js
console.log('=== Inspect shaft stairs at (305, 16, -45) ===');
const p = bot.entity.position.floored();
console.log('Floored pos:', p);

for (let y = 16; y <= 25; y++) {
  let line = `y=${y}: `;
  for (let z = -47; z <= -43; z++) {
    for (let x = 302; x <= 306; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && (b.name === 'air' || b.name === 'cave_air' || b.name === 'ladder')) {
        line += `(${x},${z}:${b.name}) `;
      }
    }
  }
  console.log(line);
}
