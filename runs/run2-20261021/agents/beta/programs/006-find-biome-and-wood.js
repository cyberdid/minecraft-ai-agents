// Find which direction has wood/grass/trees
const blocks = bot.findBlocks({
  matching: b => b.name.endsWith('_log') || b.name === 'grass_block' || b.name.endsWith('_leaves'),
  maxDistance: 256,
  count: 10
});

console.log('Found non-desert blocks within 256:', blocks.length);
if (blocks.length > 0) {
  for (const b of blocks.slice(0, 5)) {
    const block = bot.blockAt(b);
    console.log(`Block ${block.name} at ${lib.fmt(b)} (dist: ${Math.round(bot.entity.position.distanceTo(b))})`);
  }
} else {
  console.log('No trees or grass within 256 blocks from current position!');
}

// Let's also check where alpha is moving
const alpha = bot.players.alpha?.entity;
console.log('Alpha pos:', alpha ? lib.fmt(alpha.position) : 'unknown');
