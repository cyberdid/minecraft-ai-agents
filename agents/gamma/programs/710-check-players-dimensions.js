// programs/710-check-players-dimensions.js
console.log('Gamma dim:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

for (const [name, p] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  console.log(`Player ${name}: entity=${p.entity ? lib.fmt(p.entity.position) : 'not nearby'}`);
}

const portalBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'end_portal' || b.name === 'end_portal_frame'),
  maxDistance: 32,
  count: 16
});
console.log(`Nearby End Portal / Frame blocks: ${portalBlocks.length}`);
for (const pb of portalBlocks) {
  const b = bot.blockAt(pb);
  console.log(`Block ${b?.name} at ${lib.fmt(pb)}`);
}

return { dim: bot.game.dimension, pos: bot.entity.position, portalBlocks: portalBlocks.length };
