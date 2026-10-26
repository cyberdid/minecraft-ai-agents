// programs/305-inspect-exact-collision.js
console.log('Delta exact pos:', bot.entity.position);

// Check bounding box / blocks in 3x3x3 around Delta
for (let dx = -1; dx <= 1; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    for (let dy = -1; dy <= 2; dy++) {
      const p = bot.entity.position.offset(dx, dy, dz).floored();
      const b = bot.blockAt(p);
      console.log(`offset(${dx},${dy},${dz}) -> (${p.x},${p.y},${p.z}): ${b?.name} (solid: ${b?.boundingBox === 'block'})`);
    }
  }
}
