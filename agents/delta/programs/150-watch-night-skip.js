// programs/150-watch-night-skip.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Time start:', bot.time.timeOfDay, 'isDay:', bot.time.isDay);

// Monitor time for up to 25s as bed skip occurs
const startTime = Date.now();
while (Date.now() - startTime < 25000) {
  if (isCancelled()) break;
  if (bot.time.timeOfDay < 2000 || bot.time.timeOfDay > 23000) {
    console.log(`NIGHT SKIPPED TO DAWN! Current timeOfDay: ${bot.time.timeOfDay}`);
    bot.chat('delta: Dawn reached! Holding fortified advance tunnel at (44, 65, -133). Ready to receive team.');
    break;
  }
  await sleep(2000);
}

console.log('Time final:', bot.time.timeOfDay);
console.log('Health:', bot.health, 'Food:', bot.food);
