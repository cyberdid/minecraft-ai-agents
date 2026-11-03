// programs/594-check-chat-log.js
console.log('=== CHAT LOG CHECK ===');
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
bot.chat('gamma: Beta: Path back to base portal is (299, 73, -54). We are waiting for your lava bucket!');
