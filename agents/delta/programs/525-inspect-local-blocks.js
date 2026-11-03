// programs/525-inspect-local-blocks.js
console.log('=== INSPECT LOCAL BLOCKS AROUND DELTA ===');
const p = bot.entity.position;
console.log(`Delta position: ${lib.fmt(p)}`);

// Block under feet
console.log(`Block under feet: ${bot.blockAt(p.offset(0, -1, 0))?.name}`);
console.log(`Block at feet: ${bot.blockAt(p)?.name}`);
console.log(`Block at head: ${bot.blockAt(p.offset(0, 1, 0))?.name}`);

// Check adjacent blocks
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    for (let dy = -1; dy <= 2; dy++) {
      const pos = p.offset(dx, dy, dz);
      const b = bot.blockAt(pos);
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        console.log(`Block at (${dx},${dy},${dz}) [${b.position.x},${b.position.y},${b.position.z}]: ${b.name}`);
      }
    }
  }
}

// Check where the portal is
const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 32 });
if (portal) {
  console.log(`Nether portal found at: ${lib.fmt(portal.position)} (dist: ${p.distanceTo(portal.position).toFixed(1)})`);
} else {
  console.log('No nether_portal block found within 32m!');
}
