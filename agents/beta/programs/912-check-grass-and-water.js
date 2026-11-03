console.log('=== Program 912: Check Grass & Water near Base ===');
const grasses = bot.findBlocks({
  matching: b => b && (b.name === 'grass' || b.name === 'tall_grass'),
  maxDistance: 24,
  count: 30
});
console.log(`Grass patches nearby: ${grasses.length}`);

const water = bot.findBlocks({
  matching: b => b && b.name === 'water' && b.metadata === 0,
  maxDistance: 24,
  count: 5
});
console.log(`Water source blocks nearby: ${water.length}`);
for (const w of water) {
  console.log(`  water at ${lib.fmt(w)}`);
}
