// programs/166-track-alpha-and-gamma.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Check players in dimension
let activeCount = 0;
for (const name of ['alpha', 'gamma', 'beta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    activeCount++;
    const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
    console.log(`Player ${name} in Nether: pos=${lib.fmt(p.entity.position)}, dist=${d}m, held=${p.entity.heldItem?.name || 'none'}`);
  } else {
    console.log(`Player ${name}: outside loaded chunks / other dimension.`);
  }
}

bot.chat('delta: Holding bunker entrance (44, 65, -128). Alpha & Gamma, follow trail North to z=-127.');
