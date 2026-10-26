// programs/133-inspect-walkway-envelope.js
console.log('Pos:', lib.fmt(bot.entity.position));

console.log('--- Walkway Envelope z=-130 to -135 ---');
for (let z = -130; z >= -135; z--) {
  console.log(`z = ${z}:`);
  for (let y = 67; y >= 64; y--) {
    let row = `  y=${y}: `;
    for (let x = 44; x <= 46; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      row += `[x${x}: ${b?.name || 'none'}] `;
    }
    console.log(row);
  }
}
