console.log('=== SCAN GOLD VEINS AND TEAMMATES ===');
console.log('Delta pos:', lib.fmt(bot.entity.position));

const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
for (const p of players) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, dist=${p.position.distanceTo(bot.entity.position).toFixed(1)}m, held=${p.heldItem?.name || 'none'}`);
}

// Search for nether_gold_ore within 32 blocks
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_ore'),
  maxDistance: 32,
  count: 20
});
console.log(`Found ${goldOres.length} gold ores within 32m:`);
for (const gp of goldOres) {
  console.log(`  gold ore at ${lib.fmt(gp)} (dist ${bot.entity.position.distanceTo(gp).toFixed(1)}m)`);
}

// Search for Endermen
const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman');
console.log(`Found ${endermen.length} Endermen:`);
for (const ender of endermen) {
  console.log(`  Enderman at ${lib.fmt(ender.position)} (dist ${bot.entity.position.distanceTo(ender.position).toFixed(1)}m)`);
}

// Search for Piglins
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin');
console.log(`Found ${piglins.length} Piglins:`);
for (const pig of piglins.slice(0, 5)) {
  console.log(`  Piglin at ${lib.fmt(pig.position)} (dist ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m)`);
}
