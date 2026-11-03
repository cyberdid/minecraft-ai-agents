console.log('=== FORTRESS WORKSHOP BUNKER INSPECTION ===');
console.log(`Delta pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Find teammates
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Found ${players.length} teammates:`);
for (const p of players) {
  console.log(`  ${p.username} at ${lib.fmt(p.position)} (dist ${p.position.distanceTo(bot.entity.position).toFixed(1)}m), held: ${p.heldItem ? p.heldItem.name : 'empty'}`);
}

// Find crafting table
const table = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 10 });
console.log(`Crafting table: ${table ? lib.fmt(table.position) : 'none'}`);

// Find Piglins nearby
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' || e.name === 'piglin_brute');
console.log(`Found ${piglins.length} Piglins:`);
for (const pig of piglins) {
  console.log(`  ${pig.name} at ${lib.fmt(pig.position)} (dist ${pig.position.distanceTo(bot.entity.position).toFixed(1)}m)`);
}

// Find Endermen nearby
const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman');
console.log(`Found ${endermen.length} Endermen:`);
for (const ender of endermen) {
  console.log(`  enderman at ${lib.fmt(ender.position)} (dist ${ender.position.distanceTo(bot.entity.position).toFixed(1)}m)`);
}

// Find gold ore blocks nearby
const goldOres = bot.findBlocks({ matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_ore'), maxDistance: 16, count: 10 });
console.log(`Found ${goldOres.length} gold ores within 16m:`, goldOres.map(p => lib.fmt(p)));

bot.chat(`delta: Reunited inside Fortress Workshop Bunker at ${lib.fmt(bot.entity.position)}! All 4 agents active! Starting Milestone 9 pearl acquisition!`);
