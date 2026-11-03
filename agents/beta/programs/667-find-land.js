const land = bot.findBlocks({
  matching: b => b.name === 'grass_block' || b.name === 'dirt' || b.name === 'sand' || b.name === 'stone',
  maxDistance: 32,
  count: 10
});

console.log(`Found ${land.length} land blocks:`);
for (const p of land) {
  const b = bot.blockAt(p);
  const dist = bot.entity.position.distanceTo(p).toFixed(1);
  console.log(`  ${b.name} at ${p}, dist=${dist}m`);
}
