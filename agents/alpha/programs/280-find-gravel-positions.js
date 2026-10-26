// programs/280-find-gravel-positions.js
console.log('=== Program 280: Find Gravel & Nearby Blocks ===');
const pos = bot.entity.position.floored();

for (let dx = -8; dx <= 8; dx++) {
  for (let dy = -6; dy <= 6; dy++) {
    for (let dz = -8; dz <= 8; dz++) {
      const p = pos.offset(dx, dy, dz);
      const b = bot.blockAt(p);
      if (b && b.name === 'gravel') {
        console.log(`Gravel at ${lib.fmt(p)}, dist=${pos.distanceTo(p).toFixed(1)}m`);
      }
      if (b && b.name === 'mossy_cobblestone') {
        console.log(`Mossy cobblestone at ${lib.fmt(p)}`);
      }
    }
  }
}

// Check Beta
if (bot.players.beta?.entity) {
  console.log('Beta at:', lib.fmt(bot.players.beta.entity.position), 'held:', bot.players.beta.entity.heldItem?.name);
}
