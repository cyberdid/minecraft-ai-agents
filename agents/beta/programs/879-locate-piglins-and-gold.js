// programs/879-locate-piglins-and-gold.js
console.log('=== Program 879: Locate Piglins, Gold & Endermen ===');
globalThis.isProgramCancelled = isCancelled;

const p = bot.entity.position;
console.log(`Beta pos: ${lib.fmt(p)}, HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Golden boots equipped: ${bot.inventory.slots[8]?.name}`);

// 1. Check teammates
for (const [name, pl] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (pl && pl.entity) {
    const e = pl.entity;
    console.log(`Teammate ${name}: pos=${lib.fmt(e.position)}, held=${e.heldItem ? e.heldItem.name : 'empty'}`);
  }
}

// 2. Scan all Piglins within 32m
const piglins = Object.values(bot.entities).filter(e =>
  e.isValid &&
  e.name === 'piglin' &&
  p.distanceTo(e.position) <= 32
);
console.log(`Found ${piglins.length} Piglins within 32m:`);
for (const pig of piglins) {
  console.log(`  Piglin at ${lib.fmt(pig.position)} (dist: ${p.distanceTo(pig.position).toFixed(1)}m)`);
}

// 3. Scan all Endermen within 32m
const endermen = Object.values(bot.entities).filter(e =>
  e.isValid &&
  e.name === 'enderman' &&
  p.distanceTo(e.position) <= 32
);
console.log(`Found ${endermen.length} Endermen within 32m:`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)} (dist: ${p.distanceTo(end.position).toFixed(1)}m)`);
}

// 4. Scan for gold ore blocks within 24m
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone' || b.name === 'gold_block'),
  maxDistance: 24,
  count: 20
});
console.log(`Found ${ores.length} gold ore blocks within 24m:`);
for (const op of ores) {
  console.log(`  Gold ore at ${lib.fmt(op)} (dist: ${p.distanceTo(op).toFixed(1)}m)`);
}

// 5. Check crafting table
const tables = bot.findBlocks({
  matching: b => b && b.name === 'crafting_table',
  maxDistance: 16,
  count: 5
});
console.log(`Found ${tables.length} crafting tables:`, tables.map(t => lib.fmt(t)));

// Current inventory
console.log('Beta inventory:', JSON.stringify(lib.inv()));
console.log(`Ender pearls: ${lib.count('ender_pearl')}, gold_nuggets: ${lib.count('gold_nugget')}, gold_ingots: ${lib.count('gold_ingot')}`);

bot.chat(`Beta: Bunker scan — Piglins: ${piglins.length}, Endermen: ${endermen.length}, Gold veins: ${ores.length}, Pearls: ${lib.count('ender_pearl')}`);

return {
  piglins: piglins.length,
  endermen: endermen.length,
  goldOres: ores.length,
  ender_pearls: lib.count('ender_pearl')
};
