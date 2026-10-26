// programs/530-scan-spawner-balcony-architecture.js
console.log('=== Program 530: Scan Spawner Balcony Architecture ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Cobble:', lib.count('cobblestone'));

// 1. Scan West wall gap at z=-171..-175
for (let z = -171; z >= -175; z--) {
  const f = bot.blockAt(new Vec3(44, 64, z))?.name || 'air';
  const w = bot.blockAt(new Vec3(43, 65, z))?.name || 'air';
  console.log(`z=${z}: floor=${f}, west(x=43)=${w}`);
}

// 2. Scan spawner at (32, 68, -190) and surrounding blocks
const spawnerPos = new Vec3(32, 68, -190);
const spBlock = bot.blockAt(spawnerPos);
console.log(`Spawner at ${lib.fmt(spawnerPos)}: ${spBlock ? spBlock.name : 'null'}`);

// Check floor under spawner at y=67
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    const p = spawnerPos.offset(dx, -1, dz);
    const b = bot.blockAt(p);
    if (b && b.name !== 'air') {
      console.log(`  Solid block at ${lib.fmt(p)}: ${b.name}`);
    }
  }
}

// 3. Scan the gap between x=44, z=-174 and x=32, z=-190 at y=64..68
console.log('Path from (44, 64, -174) to (32, 68, -190):');
for (let step = 0; step <= 10; step++) {
  const t = step / 10;
  const sx = Math.round(44 + (32 - 44) * t);
  const sy = Math.round(64 + (68 - 64) * t);
  const sz = Math.round(-174 + (-190 - (-174)) * t);
  const floorBlock = bot.blockAt(new Vec3(sx, sy - 1, sz));
  const eyeBlock = bot.blockAt(new Vec3(sx, sy, sz));
  console.log(`  step ${step}: (${sx}, ${sy}, ${sz}) floor=${floorBlock?.name || 'air'}, space=${eyeBlock?.name || 'air'}`);
}

// 4. Teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}
