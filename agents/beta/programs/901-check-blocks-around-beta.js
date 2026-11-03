console.log('=== Program 901: Blocks around Beta ===');
const hazards = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire' || b.name === 'lava'),
  maxDistance: 16,
  count: 10
});
console.log(`Hazards count: ${hazards.length}`);
for (const h of hazards) {
  console.log(`  ${bot.blockAt(h).name} at ${lib.fmt(h)} (dist: ${bot.entity.position.distanceTo(h).toFixed(1)}m)`);
}
