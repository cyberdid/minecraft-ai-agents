// programs/231-scan-fortress-architecture.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// Scan for nether_brick blocks and other solid structures
const solids = [];
for (let x = 28; x <= 46; x++) {
  for (let z = -163; z >= -195; z--) {
    for (let y = 60; y <= 72; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air' && b.name !== 'lava') {
        solids.push({ x, y, z, name: b.name });
      }
    }
  }
}

console.log(`Found ${solids.length} solid blocks in search volume.`);

// Group solids by y-level
const byY = {};
for (const s of solids) {
  byY[s.y] = (byY[s.y] || 0) + 1;
}
console.log('Distribution by Y:');
for (const [y, count] of Object.entries(byY)) {
  console.log(`  y=${y}: ${count} blocks`);
}

// Check if there is a walkway or pillar connected to the spawner
console.log('Blocks at y=66..68 near spawner (32, 68, -190):');
for (const s of solids) {
  if (Math.abs(s.x - 32) <= 5 && Math.abs(s.z - (-190)) <= 5 && s.y >= 66 && s.y <= 69) {
    console.log(`  (${s.x}, ${s.y}, ${s.z}): ${s.name}`);
  }
}

// Check blocks along line from (44, 64, -163) to (32, 67, -190)
console.log('Solid blocks along approach (x: 44->32, z: -163->-190) at y=64..68:');
const approachSolids = solids.filter(s => s.y >= 64 && s.y <= 68);
for (const s of approachSolids.slice(0, 30)) {
  console.log(`  (${s.x}, ${s.y}, ${s.z}): ${s.name}`);
}
