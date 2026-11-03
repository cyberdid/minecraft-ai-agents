// programs/573-check-alpha.js
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
bot.chat('gamma: Alpha has bucket! Portal mold at (299, 72, -54) is ready for lava! Surface lava pool is at (333, 62, -78).');
