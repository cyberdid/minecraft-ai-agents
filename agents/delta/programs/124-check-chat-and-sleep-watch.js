// programs/124-check-chat-and-sleep-watch.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Time:', bot.time.timeOfDay, 'isDay:', bot.time.isDay);

// Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'delta') {
    if (p && p.entity) {
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      console.log(`Player ${name} loaded: pos=${lib.fmt(p.entity.position)}, dist=${d}m`);
    } else {
      console.log(`Player ${name} in other dimension / outside loaded chunks.`);
    }
  }
}

// Check nearby hostiles
const hostiles = lib.hostiles(20);
console.log(`Hostiles within 20m (${hostiles.length}):`);
for (const h of hostiles) {
  console.log(`- ${h.name} at dist ${h.dist.toFixed(1)}m`);
}

bot.chat('delta: Holding Fortress Workshop Bunker at (44, 65, -129). Dusk in Overworld - teammates sleep in beds to skip night!');
