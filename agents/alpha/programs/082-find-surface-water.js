// programs/082-find-surface-water.js
// Find nearest water source on surface near base

const waterSources = bot.findBlocks({
  matching: b => b.name === 'water' && b.metadata === 0,
  maxDistance: 64,
  count: 10
});

console.log('Water sources near base:', waterSources.map(p => lib.fmt(p)).join(', '));
