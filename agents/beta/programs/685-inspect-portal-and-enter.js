// programs/685-inspect-portal-and-enter.js
console.log('=== Program 685: Inspect Portal and Enter ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Inspect portal blocks around (299, 73, -54)
const portalBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'nether_portal' || b.name === 'obsidian'),
  maxDistance: 8,
  count: 30
});
console.log('Found portal/obsidian blocks:');
for (const p of portalBlocks) {
  const b = bot.blockAt(p);
  console.log(`- ${b.name} at ${lib.fmt(p)}`);
}

// Check blocks right between bot and portal
console.log('Blocks around bot:');
for (let dy = 0; dy <= 2; dy++) {
  for (let dz = -3; dz <= 1; dz++) {
    const p = bot.entity.position.floored().offset(0, dy, dz);
    const b = bot.blockAt(p);
    console.log(`Block at ${lib.fmt(p)}: ${b ? b.name : 'null'} (solid: ${b?.boundingBox === 'block'})`);
  }
}
