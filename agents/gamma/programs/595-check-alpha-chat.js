// programs/595-check-alpha-chat.js
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
bot.chat('gamma: Alpha: Beta and Delta are bringing lava from (331, 64, -77). Do you hold a water bucket to quench it?');
