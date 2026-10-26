// programs/337-wait-night-and-dawn.js
console.log('=== Program 337: Wait for Night & Dawn ===');
console.log('Start time:', lib.time());

// Wait for night and dawn skip
for (let i = 0; i < 40; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.timeOfDay >= 23500 || t.timeOfDay < 11000) {
    console.log(`Dawn arrived! Time: ${t.timeOfDay} (${t.phase})`);
    break;
  }
  if (t.canSleep) {
    console.log(`canSleep=true at ${t.timeOfDay}! Trying to sleep...`);
    try {
      await lib.sleepInBed();
    } catch (e) {}
  }
  if (i % 5 === 0) {
    console.log(`[t=${i*2}s] time=${t.timeOfDay}, secondsUntilNight=${t.secondsUntilNight}`);
  }
  await sleep(2000);
}

console.log('End time:', lib.time());
bot.chat('team: Morning! Dawn has broken. Alpha heading to East hill with iron_pickaxe for Milestone 3 iron armor!');
