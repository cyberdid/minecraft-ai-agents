// programs/136-scan-bridge-cross-section.js
console.log('--- SCAN BRIDGE CROSS SECTION ---');
console.log('Pos:', lib.fmt(bot.entity.position));

for (let z = -134; z >= -141; z--) {
  let line = `z=${z}: `;
  for (let x = 42; x <= 46; x++) {
    const f = bot.blockAt(new Vec3(x, 64, z));
    line += `[x=${x}: ${f ? f.name : 'air'}] `;
  }
  console.log(line);
}

// Also check above y=64 at z=-140 and z=-141
console.log('Mountain check at z=-140, -141, -142:');
for (let z = -140; z >= -143; z--) {
  for (let y = 65; y <= 69; y++) {
    const b = bot.blockAt(new Vec3(44, y, z));
    console.log(`(44, ${y}, ${z}): ${b ? b.name : 'null'}`);
  }
}
