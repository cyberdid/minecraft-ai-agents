// programs/196-inspect-spawner-balcony.js
console.log('--- INSPECT SPAWNER BALCONY GEOMETRY ---');

// Scan 9x9 around spawner at y = 67..70
const sy = 68;
console.log('Floor under spawner (y=67):');
for (let z = -187; z >= -193; z--) {
  const row = [];
  for (let x = 29; x <= 35; x++) {
    const b = bot.blockAt(new Vec3(x, 67, z));
    row.push(`x${x}:${b?.name || 'air'}`);
  }
  console.log(`z=${z}: ${row.join(', ')}`);
}

console.log('Blocks at spawner level (y=68):');
for (let z = -188; z >= -192; z--) {
  const row = [];
  for (let x = 30; x <= 34; x++) {
    const b = bot.blockAt(new Vec3(x, 68, z));
    row.push(`x${x}:${b?.name || 'air'}`);
  }
  console.log(`z=${z}: ${row.join(', ')}`);
}
