// programs/343-sleep-night-in-base.js
console.log('=== Program 343: Sleep Night in Base ===');
console.log('Start time:', lib.time());

// Wait for night and sleep
for (let i = 0; i < 30; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.timeOfDay >= 23500 || t.timeOfDay < 11000) {
    console.log(`Dawn arrived! Time: ${t.timeOfDay}`);
    break;
  }
  if (t.canSleep) {
    console.log(`canSleep=true at ${t.timeOfDay}! Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Sleeping!');
    } catch (e) {
      console.log('sleepInBed note:', e.message);
    }
  }
  if (i % 5 === 0) {
    console.log(`[t=${i*2}s] time=${t.timeOfDay}, secondsUntilNight=${t.secondsUntilNight}`);
  }
  await sleep(2000);
}

console.log('End time:', lib.time());
console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat('team: Good morning! Alpha ready to finalize full iron armor & food for Nether expedition!');
