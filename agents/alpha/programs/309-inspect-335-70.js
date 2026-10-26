// programs/309-inspect-335-70.js
console.log('=== Program 309: Inspect (335, y, -70) ===');
for (let y = 22; y >= 5; y--) {
  const p = new Vec3(335, y, -70);
  const b = bot.blockAt(p);
  console.log(`y=${y}: ${b?.name}`);
}
