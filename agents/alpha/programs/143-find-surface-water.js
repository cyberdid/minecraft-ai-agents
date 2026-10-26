// programs/143-find-surface-water.js
// Find surface water at y >= 60 (above ground rivers/lakes)
const waterSources = bot.findBlocks({
  matching: b => b.name === 'water' && b.metadata === 0,
  maxDistance: 128,
  count: 300
}).map(p => bot.blockAt(p))
  .filter(b => b && b.position.y >= 60 && bot.blockAt(b.position.offset(0, 1, 0))?.name === 'air')
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${waterSources.length} surface water sources (y >= 60) within 128 blocks.`);
for (const w of waterSources.slice(0, 5)) {
  console.log(`  Surface water at ${lib.fmt(w.position)} (dist: ${w.position.distanceTo(bot.entity.position).toFixed(1)})`);
}

// Find sheep (for wool / bed)
const sheep = Object.values(bot.entities)
  .filter(e => e && e.name === 'sheep' && e.position)
  .map(e => ({ pos: lib.fmt(e.position), dist: e.position.distanceTo(bot.entity.position).toFixed(1) }));
console.log('Nearby sheep in loaded area:', JSON.stringify(sheep));

// Time check
const t = lib.time().timeOfDay;
console.log('Time:', t, '| Night ends at 23460 (', 23460 - t, 'ticks left)');
