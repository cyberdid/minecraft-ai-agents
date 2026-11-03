// programs/443-inspect-nether-surroundings.js
console.log('=== NETHER SURROUNDINGS (GAMMA) ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

const cur = bot.entity.position;
// Look at blocks underfoot and nearby
for (let dy = -2; dy <= 2; dy++) {
  for (let dx = -3; dx <= 3; dx++) {
    for (let dz = -3; dz <= 3; dz++) {
      const p = cur.offset(dx, dy, dz).floored();
      const b = bot.blockAt(p);
      if (b && b.name !== 'air' && b.name !== 'nether_portal') {
        // Only print key structural blocks
        if (dx === 0 && dz === 0) {
          console.log(`Direct vertical (${p.x}, ${p.y}, ${p.z}): ${b.name}`);
        }
      }
    }
  }
}

// Find nether portals nearby
const portals = bot.findBlocks({ matching: mcData.blocksByName.nether_portal.id, maxDistance: 16 });
console.log('Nearby portal blocks count:', portals.length);
for (const p of portals) {
  console.log('Portal block at:', lib.fmt(p));
}

// Check other players in the dimension
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)} dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}`);
  }
}
