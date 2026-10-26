// programs/168-watch-night-skip-and-coordinate.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Time start:', bot.time.timeOfDay, 'isDay:', bot.time.isDay);

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

bot.chat('delta: Delta & Gamma holding at (44, 65, -133). Overworld dusk - sleep in base beds to skip night!');

// Watch for night skip for up to 25s
const startTime = Date.now();
while (Date.now() - startTime < 25000) {
  if (isCancelled()) break;
  if (bot.time.timeOfDay < 2000 || bot.time.timeOfDay > 23000) {
    console.log(`DAWN SKIPPED! Time now: ${bot.time.timeOfDay}`);
    bot.chat('delta: Dawn reached! Ready to receive Alpha & Beta at Fortress advance hallway.');
    break;
  }
  await sleep(2000);
}

console.log('Time final:', bot.time.timeOfDay);
console.log('Health:', bot.health, 'Food:', bot.food);
