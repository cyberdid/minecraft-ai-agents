// programs/086-scan-surface-ores.js
// Scan for exposed iron ore and coal ore at surface level (y >= 64)
console.log('alpha scanning for exposed surface ores (y >= 64)...');

const ores = ['iron_ore', 'deepslate_iron_ore', 'coal_ore'];
for (const ore of ores) {
  const blocks = bot.findBlocks({
    matching: mcData.blocksByName[ore]?.id,
    maxDistance: 64,
    count: 20
  }).filter(p => p.y >= 64);
  console.log(`Found ${ore} (y >= 64):`, blocks.map(p => lib.fmt(p)).join(', '));
}

// Also check for animals within 64 blocks on surface
const animals = ['cow', 'sheep', 'pig', 'chicken'];
for (const a of animals) {
  const count = bot.entities ? Object.values(bot.entities).filter(e => e.name === a && e.position.distanceTo(bot.entity.position) < 64).length : 0;
  console.log(`Animals nearby (${a}):`, count);
}
