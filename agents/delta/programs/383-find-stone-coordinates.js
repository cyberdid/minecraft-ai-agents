// programs/383-find-stone-coordinates.js
const stonePositions = bot.findBlocks({
  matching: mcData.blocksByName.stone.id,
  maxDistance: 32,
  count: 10
});

console.log('Stone positions nearby:');
for (const p of stonePositions) {
  const b = bot.blockAt(p);
  console.log(`  ${b.name} at ${lib.fmt(p)} dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m`);
}
