console.log('=== DELTA: STATUS & DROPS CHECK ===');
console.log('Delta pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Dropped items
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.isValid);
console.log(`Dropped items within render: ${items.length}`);
for (const it of items) {
  const dist = bot.entity.position.distanceTo(it.position);
  if (dist <= 20) {
    console.log(`- item id=${it.id} at ${lib.fmt(it.position)} (dist: ${dist.toFixed(1)}m)`);
  }
}

// Players
for (const p of Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username)) {
  console.log(`- Player ${p.username}: at ${lib.fmt(p.position)} (dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
}

// Ores nearby
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone'),
  maxDistance: 32,
  count: 20
});
console.log(`Gold ores within 32m: ${goldOres.length}`);
for (const o of goldOres.slice(0, 10)) {
  console.log(`- ${bot.blockAt(o)?.name} at ${lib.fmt(o)} (dist: ${bot.entity.position.distanceTo(o).toFixed(1)}m)`);
}

// Crafting table
const ct = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 32 });
console.log('Crafting table:', ct ? lib.fmt(ct.position) : 'none found');
