// programs/801-night-sleep-protocol.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 801: Night Sleep Protocol ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Ensure base door is closed for night safety
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// Wait for canSleep
console.log(`Current tick: ${bot.time.timeOfDay}. Waiting for sleep time (12542)...`);
const startWait = Date.now();
while (!lib.time().canSleep && Date.now() - startWait < 90000 && !isCancelled()) {
  await sleep(1000);
}

console.log(`Tick reached: ${bot.time.timeOfDay}. canSleep: ${lib.time().canSleep}`);

if (lib.time().canSleep) {
  bot.chat('Beta: Night has started! Attempting sleep in bed...');
  try {
    await lib.sleepInBed();
    console.log('Sleeping in bed! Waiting for dawn...');
    await sleep(5000);
  } catch (e) {
    console.log('Sleep in bed notice:', e.message);
  }

  // Wait until morning (time < 1000 or canSleep becomes false)
  const sleepWait = Date.now();
  while (lib.time().canSleep && Date.now() - sleepWait < 20000 && !isCancelled()) {
    await sleep(1000);
  }
}

// Re-wake / ensure standing
try { await bot.wake(); } catch (e) {}

console.log('=== Status After Night Protocol ===');
console.log('Tick:', bot.time.timeOfDay);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());

return {
  time: bot.time.timeOfDay,
  hp: bot.health,
  food: bot.food,
  canSleep: lib.time().canSleep
};
