// programs/508-scan-surroundings.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== SURROUNDINGS SCAN (64m) ===');
console.log(`Delta pos: ${lib.fmt(bot.entity.position)}`);

const entities = Object.values(bot.entities).filter(e => e && e !== bot.entity && bot.entity.position.distanceTo(e.position) <= 64);
console.log(`Found ${entities.length} entities within 64m:`);

const counts = {};
const targets = [];
for (const e of entities) {
  counts[e.name] = (counts[e.name] || 0) + 1;
  if (['enderman', 'piglin', 'piglin_brute', 'zombified_piglin', 'blaze', 'item'].includes(e.name)) {
    targets.push({
      name: e.name,
      pos: lib.fmt(e.position),
      dist: bot.entity.position.distanceTo(e.position).toFixed(1),
      id: e.id
    });
  }
}
console.log('Entity counts:', counts);
console.log('Specific targets:', targets);

// Find nether_gold_ore
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone'),
  maxDistance: 32,
  count: 20
});
console.log(`Found ${goldOres.length} nether_gold_ore blocks within 32m:`, goldOres.map(p => lib.fmt(p)));

return { targets, goldOres: goldOres.length };
