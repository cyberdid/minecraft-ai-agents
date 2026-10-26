// programs/197-scan-route-to-spawner.js
console.log('--- SCAN CORRIDOR FROM (44, 65, -161) TO (32, 68, -188) ---');

// Check line along z=-161 from x=44 down to x=32
console.log('Line along z=-161 (x=44 down to 32):');
for (let x = 44; x >= 32; x--) {
  const b64 = bot.blockAt(new Vec3(x, 64, -161));
  const b65 = bot.blockAt(new Vec3(x, 65, -161));
  const b66 = bot.blockAt(new Vec3(x, 66, -161));
  console.log(`x=${x}, z=-161: y64=${b64?.name || 'air'}, y65=${b65?.name || 'air'}, y66=${b66?.name || 'air'}`);
}

// Check line along x=32 from z=-161 down to -188
console.log('Line along x=32 (z=-161 down to -188 every 3 blocks):');
for (let z = -161; z >= -188; z -= 3) {
  const b64 = bot.blockAt(new Vec3(32, 64, z));
  const b65 = bot.blockAt(new Vec3(32, 65, z));
  const b66 = bot.blockAt(new Vec3(32, 66, z));
  const b67 = bot.blockAt(new Vec3(32, 67, z));
  console.log(`x=32, z=${z}: y64=${b64?.name || 'air'}, y65=${b65?.name || 'air'}, y66=${b66?.name || 'air'}, y67=${b67?.name || 'air'}`);
}
