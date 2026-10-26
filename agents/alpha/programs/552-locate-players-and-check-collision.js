// programs/552-locate-players-and-check-collision.js
console.log('=== Program 552: Locate Players & Tunnel Surroundings ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position));

for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    const pos = p.entity.position;
    const dist = bot.entity.position.distanceTo(pos);
    console.log(`Player ${name}: pos=${lib.fmt(pos)}, dist=${dist.toFixed(2)}m`);
  } else {
    console.log(`Player ${name}: no entity`);
  }
}

// Check adjacent blocks at x=62, 63, 64 around Alpha
for (let dx = -1; dx <= 1; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    const x = Math.floor(bot.entity.position.x) + dx;
    const z = Math.floor(bot.entity.position.z) + dz;
    const feet = bot.blockAt(new Vec3(x, 65, z))?.name || 'none';
    const head = bot.blockAt(new Vec3(x, 66, z))?.name || 'none';
    const floor = bot.blockAt(new Vec3(x, 64, z))?.name || 'none';
    console.log(`rel (${dx}, ${dz}) at (${x}, ${z}): floor(64)=${floor}, feet(65)=${feet}, head(66)=${head}`);
  }
}
