// programs/216-scan-spawner-approach.js
console.log('--- SCAN APPROACH TO BLAZE SPAWNER FROM Z=-174 ---');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Scan forward along x=44 from z=-174 to -188
console.log('Scan forward along x=44:');
for (let z = -174; z >= -188; z--) {
  const f = bot.blockAt(new Vec3(44, 64, z));
  const feet = bot.blockAt(new Vec3(44, 65, z));
  const head = bot.blockAt(new Vec3(44, 66, z));
  console.log(`z=${z}: flr(y64)=${f?.name || 'air'}, feet=${feet?.name || 'air'}`);
}

// 2. Scan towards Spawner platform (x=32..35, z=-186..-190)
console.log('Scan spawner platform entrance at z=-188:');
for (let x = 44; x >= 30; x--) {
  const f = bot.blockAt(new Vec3(x, 67, -188));
  const f64 = bot.blockAt(new Vec3(x, 64, -188));
  console.log(`x=${x}, z=-188: y67=${f?.name || 'air'}, y64=${f64?.name || 'air'}`);
}

// 3. Locate all Blazes in area
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze');
console.log(`Blazes loaded (${blazes.length}):`);
for (const b of blazes) {
  console.log(`  Blaze at ${lib.fmt(b.position)} (dist: ${bot.entity.position.distanceTo(b.position).toFixed(1)}m)`);
}

// 4. Locate teammates
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Teammate ${p.username}: ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m)`);
  }
}
