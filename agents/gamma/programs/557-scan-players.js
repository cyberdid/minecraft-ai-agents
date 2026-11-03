// programs/557-scan-players.js
console.log('=== SCAN PLAYERS & CHAT ===');
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name}: pos ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  } else {
    console.log(`Player ${name}: entity null (offline or out of range)`);
  }
}
bot.chat('gamma: Portal sill at (299, 72, -54) is AIR! Frame needs 1 obsidian at (299, 72, -54) to light!');
