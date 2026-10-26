// programs/151-check-team-and-chat.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Check players in dimension
let found = 0;
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'delta') {
    if (p && p.entity) {
      found++;
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      console.log(`Player ${name} in dimension: pos=${lib.fmt(p.entity.position)}, dist=${d}m, held=${p.entity.heldItem?.name || 'none'}`);
    } else {
      console.log(`Player ${name}: outside loaded chunks / other dimension.`);
    }
  }
}

bot.chat('delta: Holding advance tunnel at (44, 65, -133). Ready to bridge 4-block gap to netherrack mountain upon team arrival.');
