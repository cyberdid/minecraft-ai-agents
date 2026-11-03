// programs/708-inspect-pocket.js
console.log('=== Program 708: Inspect Pocket ===');
console.log('Pos:', lib.fmt(bot.entity.position));

for (let dy = -1; dy <= 3; dy++) {
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      const p = bot.entity.position.floored().offset(dx, dy, dz);
      const b = bot.blockAt(p);
      if (b && b.name === 'air') {
        console.log(`Air at ${lib.fmt(p)}`);
      }
    }
  }
}
console.log('Blocks directly above bot:');
for (let y = 51; y <= 73; y++) {
  const p = new Vec3(297, y, -54);
  const b = bot.blockAt(p);
  console.log(`y=${y}: ${b ? b.name : 'null'}`);
}
