// programs/295-search-water.js
console.log('=== Program 295: Search for Water ===');
const pos = bot.entity.position.floored();

for (let dx = -8; dx <= 8; dx++) {
  for (let dy = -6; dy <= 6; dy++) {
    for (let dz = -8; dz <= 8; dz++) {
      const p = pos.offset(dx, dy, dz);
      const b = bot.blockAt(p);
      if (b && b.name.includes('water')) {
        console.log(`Water at ${lib.fmt(p)}, dist=${pos.distanceTo(p).toFixed(1)}m`);
      }
    }
  }
}

// Teammates status
for (const name of ['beta', 'gamma', 'delta']) {
  const pl = bot.players[name]?.entity;
  if (pl) {
    console.log(`Player ${name} at ${lib.fmt(pl.position)}, held=${pl.heldItem?.name}`);
  }
}
