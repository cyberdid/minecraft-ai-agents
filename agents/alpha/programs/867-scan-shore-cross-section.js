// programs/867-scan-shore-cross-section.js
console.log('=== Program 867: Scan Shore Cross-Section ===');

for (let x = 31; x <= 36; x++) {
  const line = [];
  for (let y = 30; y <= 34; y++) {
    const b = bot.blockAt(new Vec3(x, y, -48));
    line.push(`y${y}:${b?.name}`);
  }
  console.log(`x=${x}, z=-48: [${line.join(', ')}]`);
}
