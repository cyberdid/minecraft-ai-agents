// programs/621-check-beta-bridge.js
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
bot.chat('gamma: Alpha, Delta & Gamma locked at portal frame (299, 73, -52)! Basin is ready for your lava!');
