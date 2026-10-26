// programs/313-survey-surface.js
console.log('=== Survey surface: water, animals, and lava pool ===');

// 1. Look for surface water at y >= 68
const waterBlocks = bot.findBlocks({
  matching: b => b.name === 'water' && b.metadata === 0,
  maxDistance: 48,
  count: 20
}).filter(p => p.y >= 68);

console.log(`Found ${waterBlocks.length} surface water source blocks:`);
for (const p of waterBlocks.slice(0, 5)) {
  console.log(`  Water at (${p.x}, ${p.y}, ${p.z})`);
}

// 2. Look for animals around base
const animals = Object.values(bot.entities).filter(e =>
  e.type === 'mob' && ['sheep', 'cow', 'pig', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) < 60
);
console.log(`Found ${animals.length} animals on surface:`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)}, dist: ${Math.round(bot.entity.position.distanceTo(a.position))}`);
}

// 3. Inspect surface lava pool around (333, 62, -78)
const lavaBlocks = bot.findBlocks({
  matching: b => b.name === 'lava',
  maxDistance: 64,
  count: 30
});
console.log(`Found ${lavaBlocks.length} lava blocks within 64m:`);
for (const p of lavaBlocks.slice(0, 5)) {
  console.log(`  Lava at (${p.x}, ${p.y}, ${p.z})`);
}

// 4. Check Alpha position
const alpha = Object.values(bot.entities).find(e => e.type === 'player' && e.username.includes('alpha'));
if (alpha) {
  console.log(`Alpha is at ${lib.fmt(alpha.position)}`);
}
