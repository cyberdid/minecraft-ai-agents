// programs/291-survey-iron-spot.js
console.log('=== SURVEY IRON SPOT ===');
const target = new Vec3(276, 61, -78);

for (let y = 75; y >= 55; y--) {
  const p = new Vec3(target.x, y, target.z);
  const b = bot.blockAt(p);
  console.log(`y=${y}: ${b ? b.name : 'null'}`);
}

console.log('\nChecking adjacent blocks around (276, 61, -78):');
for (const [dx, dz] of [[0, 1], [0, -1], [1, 0], [-1, 0], [0, 0]]) {
  const p = target.offset(dx, 0, dz);
  const b = bot.blockAt(p);
  console.log(`  (${p.x}, ${p.y}, ${p.z}): ${b ? b.name : 'null'}`);
}
