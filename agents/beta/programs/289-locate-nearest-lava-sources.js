// programs/289-locate-nearest-lava-sources.js
console.log('=== Scan Lava Sources from Base (294, 72, -54) ===');

const lavaSources = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 128,
  count: 150
});

console.log(`Total lava source blocks found: ${lavaSources.length}`);
const clusters = {};
for (const p of lavaSources) {
  const k = `${Math.floor(p.x / 16) * 16}, ${p.y}, ${Math.floor(p.z / 16) * 16}`;
  clusters[k] = (clusters[k] || 0) + 1;
}

for (const [k, count] of Object.entries(clusters)) {
  console.log(`Lava cluster at [${k}]: ${count} source blocks`);
}

// Print nearest 5 lava sources with exact coordinates
const nearest = [...lavaSources].sort((a, b) => 
  a.distanceTo(bot.entity.position) - b.distanceTo(bot.entity.position)
).slice(0, 10);

console.log('Nearest 10 lava sources:\n' + nearest.map(p => `${lib.fmt(p)} dist=${p.distanceTo(bot.entity.position).toFixed(1)}`).join('\n'));
