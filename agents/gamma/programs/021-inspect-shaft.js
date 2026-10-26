// programs/021-inspect-shaft.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// Look down around (302, 71, -44)
for (let y = 71; y >= 60; y--) {
  const airBlocks = [];
  for (let dx = -3; dx <= 3; dx++) {
    for (let dz = -3; dz <= 3; dz++) {
      const b = bot.blockAt(new Vec3(302 + dx, y, -44 + dz));
      if (b && (b.name === 'air' || b.name === 'cave_air')) {
        airBlocks.push(`(${302 + dx}, ${y}, ${-44 + dz})`);
      }
    }
  }
  if (airBlocks.length > 0) {
    console.log(`y=${y}: air at`, airBlocks.slice(0, 5).join(', '));
  }
}

// Check coal vein we detected earlier at (293, 66, -44)
const coalBlocks = bot.findBlocks({ matching: b => b.name === 'coal_ore' || b.name === 'deepslate_coal_ore', maxDistance: 16, count: 10 });
console.log('Coal blocks near shaft:', coalBlocks.map(p => lib.fmt(p)));
