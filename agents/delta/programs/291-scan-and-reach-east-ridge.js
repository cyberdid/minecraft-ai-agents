// programs/291-scan-and-reach-east-ridge.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'health:', bot.health);

// Check blocks immediately under and around Delta
for (let dx = -1; dx <= 1; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    for (let dy = -1; dy <= 2; dy++) {
      const p = bot.entity.position.offset(dx, dy, dz).floored();
      const b = bot.blockAt(p);
      if (b && b.name.includes('fire')) {
        console.log(`DANGER FIRE at ${lib.fmt(p)}: ${b.name}`);
        // Extinguish it
        try {
          await bot.dig(b);
          console.log(`Extinguished fire at ${lib.fmt(p)}`);
        } catch (e) {}
      }
    }
  }
}

// Find all fire within 10m
const fires = bot.findBlocks({
  matching: b => b.name.includes('fire'),
  maxDistance: 10,
  count: 10
});
console.log(`Nearby fire count: ${fires.length}`);
for (const f of fires) {
  console.log(`  Fire at ${lib.fmt(f)} (${bot.blockAt(f).name})`);
}

// Scan elevation from x=47 to x=63 at z=-3, -4, -5
for (let z = -3; z >= -6; z--) {
  let line = `z=${z}: `;
  for (let x = 48; x <= 63; x += 3) {
    const b = bot.blockAt(new Vec3(x, 65, z));
    const bFloor = bot.blockAt(new Vec3(x, 64, z));
    line += `x${x}:[flr=${bFloor?.name},at=${b?.name}] `;
  }
  console.log(line);
}
