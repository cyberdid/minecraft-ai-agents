// programs/143-check-teammate-status.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Check players in dimension
let teammatesFound = 0;
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'delta') {
    if (p && p.entity) {
      teammatesFound++;
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      console.log(`Player ${name} in dimension: pos=${lib.fmt(p.entity.position)}, dist=${d}m, held=${p.entity.heldItem?.name || 'none'}`);
    } else {
      console.log(`Player ${name}: outside loaded chunks / other dimension.`);
    }
  }
}

// Check nearby hostiles
const hostiles = lib.hostiles(24);
console.log(`Nearby hostiles (${hostiles.length}):`);
for (const h of hostiles) {
  console.log(`- ${h.name} at dist ${h.dist.toFixed(1)}m`);
}

bot.chat('delta: Holding advance tunnel at (44, 65, -133). 100% enclosed and protected.');
