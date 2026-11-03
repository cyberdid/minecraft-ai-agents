// programs/789-check-elevation.js
console.log('=== Program 789: Elevation Scan ===');
const p = bot.entity.position;
console.log('Pos:', p);

for (let y = 62; y <= 68; y++) {
  const row = [];
  for (let z = -36; z <= -30; z++) {
    const b = bot.blockAt(new Vec3(63, y, z));
    row.push(`z${z}:${b ? b.name : 'null'}`);
  }
  console.log(`y=${y}: ${row.join(', ')}`);
}
