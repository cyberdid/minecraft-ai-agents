// programs/147-detailed-scan-z136-to-z145.js
console.log('Pos:', lib.fmt(bot.entity.position));

console.log('--- Detailed Block Scan from z=-135 to -145 ---');
for (let z = -135; z >= -145; z--) {
  let report = [];
  for (let y = 64; y <= 72; y++) {
    for (let x = 42; x <= 46; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        report.push(`(${x},${y}):${b.name}`);
      }
    }
  }
  console.log(`z=${z}: ${report.join(', ') || 'ALL AIR'}`);
}
