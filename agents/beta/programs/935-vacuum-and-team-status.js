console.log('=== Program 935: Vacuum and Team Status ===');
globalThis.isProgramCancelled = isCancelled;

await lib.pickup(8.0);

console.log('Current Beta Inventory:', JSON.stringify(lib.inv()));
console.log('Beta pearls:', lib.count('ender_pearl'));

for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Teammate ${p.username}: pos=${lib.fmt(p.entity.position)}, held=${p.entity.heldItem ? p.entity.heldItem.name : 'none'}`);
  }
}

// Find all items nearby
const items = Object.values(bot.entities).filter(e =>
  e.name === 'item' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16
);
console.log(`Items within 16m: ${items.length}`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)}, dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// Scan nether_gold_ore
const goldOres = bot.findBlocks({
  matching: b => b && b.name === 'nether_gold_ore',
  maxDistance: 32,
  count: 30
});
console.log(`Nether gold ores found within 32m: ${goldOres.length}`);
for (let i = 0; i < Math.min(10, goldOres.length); i++) {
  console.log(`  Ore ${i+1}: pos=${lib.fmt(goldOres[i])}, dist=${bot.entity.position.distanceTo(goldOres[i]).toFixed(1)}m`);
}

return {
  pearls: lib.count('ender_pearl'),
  goldOresCount: goldOres.length,
  goldNuggets: lib.count('gold_nugget'),
  goldIngots: lib.count('gold_ingot'),
  inv: lib.inv()
};
