// programs/230-examine-spawner-and-bridge.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// 1. Check spawner block
const spawnerPos = new Vec3(32, 68, -190);
const spawnerBlock = bot.blockAt(spawnerPos);
console.log('Block at (32, 68, -190):', spawnerBlock?.name || 'out of render range or null');

// Check nearby blocks around spawner if loaded
for (let dy = -2; dy <= 2; dy++) {
  const b = bot.blockAt(spawnerPos.offset(0, dy, 0));
  console.log(`y=${68+dy}: ${b?.name || 'none'}`);
}

// 2. Check blocks immediately around Delta at (44, 65, -163)
console.log('--- SURROUNDING BLOCKS AT (44, 65, -163) ---');
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = -1; dy <= 2; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      const p = new Vec3(44 + dx, 65 + dy, -163 + dz);
      const b = bot.blockAt(p);
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        console.log(`(${p.x}, ${p.y}, ${p.z}): ${b.name}`);
      }
    }
  }
}
