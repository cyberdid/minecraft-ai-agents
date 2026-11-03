// programs/868-sleep-night-with-team.js
console.log('=== Program 868: Enter Base & Sleep Night ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Enter base shelter
console.log('Entering base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(294, 72, -55, 1.2, { timeoutMs: 5000 }); } catch (e2) {}
}

console.log(`Inside base! Pos: ${lib.fmt(bot.entity.position)}, time: ${bot.time.timeOfDay}`);
bot.chat('Beta: In base by Bed 1. Waiting for tick 12542 to sleep together!');

while (bot.time.timeOfDay < 12542 && bot.time.timeOfDay > 500 && !checkCancelled()) {
  await sleep(1000);
}

if (!checkCancelled()) {
  console.log(`Dusk reached: ${bot.time.timeOfDay}! Sleeping...`);
  try {
    await lib.sleep();
    console.log('lib.sleep succeeded!');
  } catch (err) {
    const bed = bot.findBlock({ matching: b => b && b.name.endsWith('_bed'), maxDistance: 6 });
    if (bed) {
      try { await bot.sleep(bed); } catch (e) {}
    }
  }

  // Wait for morning
  const start = Date.now();
  while (bot.time.timeOfDay >= 12542 && Date.now() - start < 10000 && !checkCancelled()) {
    await sleep(500);
  }
}

bot.chat(`Beta: Good morning! Time: ${bot.time.timeOfDay}. Ready!`);
console.log(`Final time: ${bot.time.timeOfDay}, pos: ${lib.fmt(bot.entity.position)}`);

return {
  time: bot.time.timeOfDay,
  pos: bot.entity.position
};
