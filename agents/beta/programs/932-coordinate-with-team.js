console.log('=== Program 932: Coordinate With Team ===');
console.log('Beta pos:', lib.fmt(bot.entity.position), 'Pearls:', lib.count('ender_pearl'));

bot.chat('Beta: Delta! I harvested 2 Ender Pearls from Piglins at (43, 67, -116)! 3 Piglins are here right next to me. Come barter your 2 gold ingots!');

for (const p of Object.values(bot.players)) {
  if (p.entity) {
    console.log(`Teammate ${p.username}: pos=${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// Check Endermen within 64m
const endermen = Object.values(bot.entities).filter(e =>
  e.isValid && e.name === 'enderman' && bot.entity.position.distanceTo(e.position) <= 64
);
console.log(`Endermen within 64m: ${endermen.length}`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)}, dist=${bot.entity.position.distanceTo(end.position).toFixed(1)}m`);
}

// Check nether_gold_ore nearby
const goldOres = bot.findBlocks({
  matching: b => b && b.name === 'nether_gold_ore',
  maxDistance: 32,
  count: 20
});
console.log(`Nether gold ores nearby: ${goldOres.length}`);
for (let i = 0; i < Math.min(5, goldOres.length); i++) {
  console.log(`  Ore at ${lib.fmt(goldOres[i])}, dist=${bot.entity.position.distanceTo(goldOres[i]).toFixed(1)}m`);
}
