// programs/732-map-pillbox.js
console.log('=== Map Pillbox & Spawner Balcony ===');
const lines = [];
for (let y = 68; y >= 65; y--) {
  console.log(`--- Y = ${y} ---`);
  for (let z = -191; z <= -185; z++) {
    let row = `z=${z}: `;
    for (let x = 32; x <= 38; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      const code = b ? (b.name === 'air' || b.name === 'cave_air' ? '.' : b.name[0]) : '?';
      row += `${code} `;
    }
    console.log(row);
  }
}

// Legend
console.log('Legend: . = air, c = cobblestone, n = nether_bricks, s = soul_sand/soil');
