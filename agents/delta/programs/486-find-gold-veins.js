// programs/486-find-gold-veins.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
console.log('Searching for nether_gold_ore (id: ' + goldOreId + ') within 48 blocks...');

const ores = bot.findBlocks({
  matching: goldOreId,
  maxDistance: 48,
  count: 30
});

console.log(`Found ${ores.length} nether_gold_ore blocks!`);
for (const p of ores) {
  const dist = bot.entity.position.distanceTo(p).toFixed(1);
  console.log(`- ore at ${lib.fmt(p)} (dist: ${dist}m)`);
}

// Also check for Piglins
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && e.isValid);
console.log(`Nearby Piglins (${piglins.length}):`, piglins.map(p => `${lib.fmt(p.position)} (dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`).join(', '));

// Also check for Endermen
const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && e.isValid);
console.log(`Nearby Endermen (${endermen.length}):`, endermen.map(p => `${lib.fmt(p.position)} (dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`).join(', '));

return {
  pos: bot.entity.position,
  oresCount: ores.length,
  ores: ores.slice(0, 5),
  piglins: piglins.length,
  endermen: endermen.length
};
