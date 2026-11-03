// programs/854-sleep-at-tick-12542.js
console.log('=== Program 854: Sleep at Dusk / Advance to Morning ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Enter base shelter
console.log('Entering base shelter...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(294, 72, -55, 1.2, { timeoutMs: 5000 }); } catch (e2) {}
}

console.log(`Inside base! Pos: ${lib.fmt(bot.entity.position)}, time: ${bot.time.timeOfDay}`);
bot.chat('Beta: Inside base by Bed 1. Waiting for tick 12542 to sleep together!');

// Wait for tick 12542 (or night)
while (bot.time.timeOfDay < 12542 && bot.time.timeOfDay > 500 && !checkCancelled()) {
  await sleep(1000);
}

if (!checkCancelled()) {
  console.log(`Dusk arrived! Time: ${bot.time.timeOfDay}. Attempting to sleep...`);
  try {
    await lib.sleep();
    console.log('lib.sleep succeeded! Night skipped!');
  } catch (err) {
    console.log(`lib.sleep notice: ${err.message}. Trying bot.sleep...`);
    const bed = bot.findBlock({ matching: b => b && b.name.endsWith('_bed'), maxDistance: 6 });
    if (bed) {
      try {
        await bot.sleep(bed);
        console.log('Sleeping in bed!');
      } catch (e2) {
        console.log(`bot.sleep error: ${e2.message}`);
      }
    }
  }

  // Wait for morning
  const start = Date.now();
  while (bot.time.timeOfDay >= 12542 && Date.now() - start < 10000 && !checkCancelled()) {
    await sleep(500);
  }
}

bot.chat(`Beta: Good morning! Time: ${bot.time.timeOfDay}. Departing for lava scoop!`);
console.log(`Final time: ${bot.time.timeOfDay}, pos: ${lib.fmt(bot.entity.position)}`);

return {
  time: bot.time.timeOfDay,
  pos: bot.entity.position
};
