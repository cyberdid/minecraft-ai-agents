// programs/583-check-alpha-lava.js
console.log('=== CHECK ALPHA LAVA STATUS ===');
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
bot.chat('gamma: Alpha is at the surface lava pool (332, 64, -75)! Mold at (299, 72, -54) is ready for your lava!');
