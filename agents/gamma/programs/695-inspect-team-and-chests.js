// programs/695-inspect-team-and-chests.js
console.log('Gamma at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Check all players
for (const [name, p] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  const entity = p.entity;
  if (entity) {
    console.log(`Player ${name} is at ${lib.fmt(entity.position)} dist=${bot.entity.position.distanceTo(entity.position).toFixed(1)}m`);
  } else {
    console.log(`Player ${name} entity not loaded in range.`);
  }
}

// Find all chests in base
const chests = bot.findBlocks({
  matching: b => b && (b.name === 'chest' || b.name === 'trapped_chest'),
  maxDistance: 12
});
console.log(`Found ${chests.length} chests nearby:`);
for (const cp of chests) {
  console.log(`Chest at ${lib.fmt(cp)}`);
}

return { pos: bot.entity.position, chests: chests.length };
