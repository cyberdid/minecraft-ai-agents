// programs/145-map-west-route-to-spawner.js
console.log('--- MAP WEST ROUTE TOWARDS SPAWNER (32, 68, -190) ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Scan x=43 down to x=32 along z=-140 to -145 across y=63..68
for (let z = -140; z >= -145; z--) {
  let summary = `z=${z}: `;
  for (let x = 44; x >= 32; x -= 2) {
    let solidY = [];
    for (let y = 64; y <= 68; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.boundingBox === 'block') solidY.push(`${y}:${b.name.slice(0, 4)}`);
    }
    summary += `[x=${x}: ${solidY.length ? solidY.join(',') : 'air'}] `;
  }
  console.log(summary);
}

// 2. Also check directly North along x=44 up to z=-155
console.log('Scan North along x=44 up to z=-155:');
for (let z = -143; z >= -155; z--) {
  let solidY = [];
  for (let y = 63; y <= 72; y++) {
    const b = bot.blockAt(new Vec3(44, y, z));
    if (b && b.boundingBox === 'block') solidY.push(`${y}:${b.name.slice(0, 4)}`);
  }
  if (solidY.length > 0) console.log(`z=${z}: ${solidY.join(', ')}`);
  else console.log(`z=${z}: ALL AIR`);
}

// 3. Check teammate positions
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}m`);
  }
}
