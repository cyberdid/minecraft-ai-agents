// programs/176-track-alpha-approach.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Check players in dimension
let count = 0;
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'delta') {
    if (p && p.entity) {
      count++;
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      console.log(`Player ${name} in dimension: pos=${lib.fmt(p.entity.position)}, dist=${d}m, held=${p.entity.heldItem?.name || 'none'}`);
    } else {
      console.log(`Player ${name}: outside loaded chunks / other dimension.`);
    }
  }
}

bot.chat('delta: Holding bunker entrance (44, 65, -128). Alpha, trail is clear to bunker doorway.');
