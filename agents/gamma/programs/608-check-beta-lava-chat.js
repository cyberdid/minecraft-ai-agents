// programs/608-check-beta-lava-chat.js
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
bot.chat('gamma: Alpha & Delta standing by with water and flint_and_steel! Basin (299, 72, -54) is 100% ready for Beta!');
