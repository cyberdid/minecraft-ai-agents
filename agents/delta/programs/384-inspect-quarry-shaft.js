// programs/384-inspect-quarry-shaft.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// Walk outside base to quarry entrance at (302, 71, -44)
console.log('Going to quarry entrance at (302, 71, -44)...');
await lib.goTo(302, 71, -44, 1.5, { timeoutMs: 10000 });
console.log('Arrived at quarry entrance! Pos:', lib.fmt(bot.entity.position));

// Find exposed stone near quarry entrance
const stoneBlocks = bot.findBlocks({
  matching: mcData.blocksByName.stone.id,
  maxDistance: 6,
  count: 5
});

console.log(`Exposed stone within 6m (${stoneBlocks.length}):`);
for (const p of stoneBlocks) {
  console.log(`  stone at ${lib.fmt(p)}`);
}

// Dig 4 stone blocks to get cobblestone!
for (const p of stoneBlocks.slice(0, 4)) {
  const b = bot.blockAt(p);
  if (b && bot.canDigBlock(b)) {
    console.log(`Digging ${b.name} at ${lib.fmt(p)}...`);
    await bot.dig(b);
  }
}

await lib.pickup(5);
console.log(`Cobblestone in inventory: ${lib.count('cobblestone')}`);
