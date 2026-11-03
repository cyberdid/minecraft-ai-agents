// programs/834-check-obsidian.js
console.log('=== Program 834: Check Obsidian within 32m ===');
const p = bot.entity.position;
const obs = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  maxDistance: 32,
  count: 20
});
console.log(`Found ${obs.length} obsidian blocks:`, obs.map(l => `${lib.fmt(l)} dist=${p.distanceTo(l).toFixed(1)}`));
