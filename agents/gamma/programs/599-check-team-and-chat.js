// programs/599-check-team-and-chat.js
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
bot.chat('gamma: Beta: Surface lava pool is at (333, 62, -78) on surface! Do not go down the deep shaft!');
