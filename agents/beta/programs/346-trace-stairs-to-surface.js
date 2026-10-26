// programs/346-trace-stairs-to-surface.js
console.log('=== Trace stairs from y=22 to surface ===');

for (let y = 23; y <= 35; y++) {
  let line = `y=${y}: `;
  for (let z = -46; z <= -40; z++) {
    for (let x = 300; x <= 304; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && (b.name === 'air' || b.name === 'cave_air')) {
        line += `(${x},${z}) `;
      }
    }
  }
  console.log(line);
}
