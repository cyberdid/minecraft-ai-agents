for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name}: pos ${lib.fmt(p.entity.position)}, hp ${p.entity.health || '?'}, held ${p.entity.heldItem?.name || 'none'}`);
  } else {
    console.log(`Player ${name}: no entity in view`);
  }
}
console.log('Bot pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
