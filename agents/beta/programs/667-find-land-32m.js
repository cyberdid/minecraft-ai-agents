const land = bot.findBlocks({
  matching: b => b.name !== 'water' && b.name !== 'air' && b.name !== 'seagrass' && b.name !== 'kelp' && b.name !== 'tall_seagrass',
  maxDistance: 32,
  count: 20
});
console.log(`Found ${land.length} solid blocks within 32m:`);
for (const p of land.slice(0, 8)) {
  const b = bot.blockAt(p);
  console.log(`  ${b.name} at ${p}, dist ${bot.entity.position.distanceTo(p).toFixed(1)}m`);
}
