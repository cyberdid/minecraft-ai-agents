// programs/117-map-bunker-and-fortify.js
console.log('Pos:', lib.fmt(bot.entity.position));

// Scan 7x7 around (44, 65, -128) from y=64 to y=68
console.log('Mapping bunker structure:');
for (let y = 68; y >= 64; y--) {
  console.log(`--- Y = ${y} ---`);
  for (let z = -132; z <= -126; z++) {
    let row = `z=${z}: `;
    for (let x = 42; x <= 47; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      const code = b ? (b.name === 'air' || b.name === 'cave_air' ? '.' : b.name[0]) : '?';
      row += `${code} `;
    }
    console.log(row);
  }
}

// Legend of blocks found
const seen = new Set();
for (let y = 64; y <= 68; y++) {
  for (let z = -132; z <= -126; z++) {
    for (let x = 42; x <= 47; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        seen.add(`${b.name[0]} = ${b.name}`);
      }
    }
  }
}
console.log('Legend:', Array.from(seen).join(', '));
