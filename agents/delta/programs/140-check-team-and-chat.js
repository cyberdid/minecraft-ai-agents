// programs/140-check-team-and-chat.js
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

bot.chat('delta: Holding advance tunnel at (44, 65, -133). 100% enclosed and protected.');
