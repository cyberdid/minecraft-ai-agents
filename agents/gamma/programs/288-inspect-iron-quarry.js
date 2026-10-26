// programs/288-inspect-iron-quarry.js
console.log('=== INSPECT IRON QUARRY ===');
console.log('Gamma pos:', lib.fmt(bot.entity.position));

// Find all iron ores within 32 blocks
const ironOres = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 32,
  count: 15
});

console.log(`Iron ores (${ironOres.length}):`);
for (const p of ironOres) {
  const b = bot.blockAt(p);
  const above = bot.blockAt(p.offset(0, 1, 0));
  console.log(`  ${b.name} at ${lib.fmt(p)} | block above: ${above ? above.name : 'null'} | dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m`);
}

// Check coal ores
const coalOres = bot.findBlocks({
  matching: b => b && (b.name === 'coal_ore' || b.name === 'deepslate_coal_ore'),
  maxDistance: 32,
  count: 10
});
console.log(`Coal ores (${coalOres.length}):`);
for (const p of coalOres.slice(0, 5)) {
  console.log(`  coal_ore at ${lib.fmt(p)} | dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m`);
}

// Check stone / quarry blocks near (276, 65, -78)
const nearbyStone = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'cobblestone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 20,
  count: 20
});
console.log(`Nearby stone/andesite/diorite (${nearbyStone.length}):`);
for (const p of nearbyStone.slice(0, 5)) {
  console.log(`  ${bot.blockAt(p).name} at ${lib.fmt(p)}`);
}

// Check animals nearby
const animals = Object.values(bot.entities).filter(e => e && ['cow', 'pig', 'sheep', 'chicken'].includes(e.name));
console.log('Animals nearby:', animals.map(e => `${e.name} at ${lib.fmt(e.position)} (dist: ${bot.entity.position.distanceTo(e.position).toFixed(1)}m)`));
