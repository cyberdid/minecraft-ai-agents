// programs/700-scan-nether-gold-and-players.js
console.log('=== Scan Nether from:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Find other players
for (const [name, player] of Object.entries(bot.players)) {
  if (player.entity) {
    console.log(`Player ${name}: pos=${lib.fmt(player.entity.position)}, held=${player.entity.heldItem?.name}`);
  }
}

// Find nether_gold_ore up to 64 blocks away
const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
console.log('nether_gold_ore block id:', goldOreId);
if (goldOreId) {
  const blocks = bot.findBlocks({ matching: goldOreId, maxDistance: 64, count: 30 });
  console.log(`Found ${blocks.length} nether_gold_ore blocks within 64m:`);
  for (const p of blocks.slice(0, 15)) {
    const dist = bot.entity.position.distanceTo(p).toFixed(1);
    console.log(` - ${lib.fmt(p)} dist=${dist}m`);
  }
}

// Find nearby Piglins
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin');
console.log(`Found ${piglins.length} Piglins:`);
for (const pig of piglins.slice(0, 8)) {
  console.log(` - Piglin at ${lib.fmt(pig.position)} dist=${bot.entity.position.distanceTo(pig.position).toFixed(1)}m`);
}
