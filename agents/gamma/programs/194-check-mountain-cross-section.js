// programs/194-check-mountain-cross-section.js
console.log('--- CHECK MOUNTAIN CROSS-SECTION TO THE WEST ---');
console.log('Current pos:', lib.fmt(bot.entity.position));

// Scan X from 44 down to 36, at Z = -148 and -150, for Y = 64..68
for (const z of [-148, -150, -152]) {
  console.log(`--- Cross-section at Z = ${z} ---`);
  for (let x = 44; x >= 36; x--) {
    const col = [];
    for (let y = 64; y <= 67; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      col.push(`y${y}:${b?.name || 'air'}`);
    }
    console.log(`x=${x}: ${col.join(', ')}`);
  }
}
