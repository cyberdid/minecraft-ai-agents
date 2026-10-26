// programs/132-check-chat-and-team.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Check players in dimension
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'delta') {
    if (p && p.entity) {
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}, dist=${d}m, held=${p.entity.heldItem?.name || 'none'}`);
    } else {
      console.log(`Player ${name}: not in loaded chunks/dimension.`);
    }
  }
}

bot.chat('delta: Holding Fortress Workshop Bunker at (44, 65, -129). Ready to receive teammates or assist path.');
