console.log('=== FIND ANIMALS WITHIN 160 METERS ===');
const animals = Object.values(bot.entities).filter(e =>
  (e.name === 'cow' || e.name === 'pig' || e.name === 'sheep' || e.name === 'chicken') &&
  e.isValid
);
console.log(`Entities found in memory (${animals.length}):`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)} (dist ${bot.entity.position.distanceTo(a.position).toFixed(1)}m)`);
}

// Check nearby oak leaves for apples
const leaves = bot.findBlocks({
  matching: b => b && b.name.includes('leaves'),
  maxDistance: 32,
  count: 10
});
console.log(`Leaves nearby: ${leaves.length}`);
