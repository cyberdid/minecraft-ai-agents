// programs/130-track-gamma-arrival.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Track Gamma for up to 25 seconds
const startTime = Date.now();
while (Date.now() - startTime < 25000) {
  if (isCancelled()) break;
  const g = bot.players['gamma'];
  if (g && g.entity) {
    const d = Math.round(bot.entity.position.distanceTo(g.entity.position));
    console.log(`Gamma pos: ${lib.fmt(g.entity.position)}, distance: ${d}m`);
    if (d <= 5) {
      console.log('GAMMA HAS ARRIVED AT FORTRESS BUNKER!');
      bot.chat('delta: Welcome Gamma! Fortress bunker at (44, 65, -129) is secure. Blaze Spawner confirmed at (32, 68, -190)!');
      break;
    }
  } else {
    console.log('Gamma not yet in local loaded area...');
  }
  await sleep(3000);
}

console.log('Pos final:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
