// programs/279-find-gravel-or-exit.js
console.log('=== Program 279: Search Blocks in 10m ===');
const pos = bot.entity.position.floored();

const blockCounts = {};
for (let dx = -10; dx <= 10; dx++) {
  for (let dy = -10; dy <= 10; dy++) {
    for (let dz = -10; dz <= 10; dz++) {
      const b = bot.blockAt(pos.offset(dx, dy, dz));
      if (b) {
        blockCounts[b.name] = (blockCounts[b.name] || 0) + 1;
      }
    }
  }
}

console.log('Block counts in 10m radius:', JSON.stringify(blockCounts));

// Check teammates
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name]?.entity;
  if (p) {
    console.log(`Player ${name} at ${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
  }
}
