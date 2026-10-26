// programs/360-inspect-east-at-y32.js
console.log('=== Inspect east from x=304..315 for y=30..40 ===');

for (let y = 30; y <= 40; y++) {
  let line = `y=${y}: `;
  for (let z = -43; z <= -33; z++) {
    for (let x = 304; x <= 312; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && (b.name === 'air' || b.name === 'cave_air')) {
        line += `(${x},${z}) `;
      }
    }
  }
  console.log(line);
}
