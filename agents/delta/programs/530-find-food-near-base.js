// programs/530-find-food-near-base.js
console.log('=== DELTA: FOOD SCAN NEAR BASE ===');
console.log(`Delta pos: ${lib.fmt(bot.entity.position)}, Food: ${bot.food}, HP: ${bot.health}`);

// Scan entities
const mobs = Object.values(bot.entities).filter(e =>
  e !== bot.entity &&
  ['cow', 'pig', 'sheep', 'chicken'].includes(e.name)
).map(e => ({ name: e.name, pos: lib.fmt(e.position), dist: bot.entity.position.distanceTo(e.position).toFixed(1) }))
.sort((a, b) => a.dist - b.dist);

console.log(`Passive mobs found within view distance: ${mobs.length}`);
console.log(mobs.slice(0, 10));

// Scan dropped items
const items = Object.values(bot.entities).filter(e => e.name === 'item')
  .map(e => `Item: id=${e.id} at ${lib.fmt(e.position)} (dist: ${bot.entity.position.distanceTo(e.position).toFixed(1)})`);
console.log(`Items on ground: ${items.length}`);
console.log(items.slice(0, 10).join('\n') || 'None');

// Scan crop blocks or hay bales
const crops = bot.findBlocks({
  matching: b => b && ['wheat', 'carrots', 'potatoes', 'hay_block', 'sweet_berry_bush'].includes(b.name),
  maxDistance: 64,
  count: 10
});
console.log(`Crops / hay blocks found: ${crops.length}`);
for (const cp of crops) {
  const b = bot.blockAt(cp);
  console.log(`  ${b.name} at ${lib.fmt(cp)}`);
}

return { mobs: mobs.length, crops: crops.length };
