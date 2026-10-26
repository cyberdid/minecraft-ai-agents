// programs/122-wait-and-listen.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Check all players
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'delta') {
    if (p && p.entity) {
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      console.log(`Player ${name} in same dimension: pos=${lib.fmt(p.entity.position)}, dist=${d}m, held=${p.entity.heldItem?.name || 'none'}`);
    } else {
      console.log(`Player ${name} not in current loaded chunks/dimension.`);
    }
  }
}

bot.chat('delta: Holding Fortress Workshop Bunker at (44, 65, -129). Bunker is 100% roofed & blast-proof. Standing by for Alpha arrival.');
