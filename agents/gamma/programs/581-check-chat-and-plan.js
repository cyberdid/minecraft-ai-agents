// programs/581-check-chat-and-plan.js
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
bot.chat('gamma: Alpha holds bucket! I can guide to surface lava pool (333, 62, -78) or help scoop lava!');
