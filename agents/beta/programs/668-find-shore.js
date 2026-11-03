const shore = bot.findBlocks({
  matching: b => b && b.name !== 'air' && b.name !== 'water' && b.position && b.position.y >= 62,
  maxDistance: 64,
  count: 10
});

console.log(`Found ${shore.length} shore blocks with y >= 62:`);
for (const p of shore) {
  const b = bot.blockAt(p);
  const dist = bot.entity.position.distanceTo(p).toFixed(1);
  console.log(`  ${b.name} at ${p}, dist=${dist}m`);
}
