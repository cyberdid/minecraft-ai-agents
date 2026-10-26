// programs/307-inspect-column-70.js
console.log('=== Program 307: Inspect Column at (336, y, -70) ===');
for (let y = 22; y >= 10; y--) {
  const p = new Vec3(336, y, -70);
  const b = bot.blockAt(p);
  console.log(`y=${y}: ${b?.name}`);
}
