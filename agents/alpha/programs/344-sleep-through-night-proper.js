// programs/344-sleep-through-night-proper.js
console.log('=== Program 344: Sleep Through Night Proper ===');
console.log('Start time:', lib.time());

// Deposit 3 iron ingots in chest so team can craft armor
try {
  if (lib.count('iron_ingot') > 0) {
    console.log(`Depositing ${lib.count('iron_ingot')} iron_ingots in base chest...`);
    await lib.deposit({ iron_ingot: lib.count('iron_ingot') }, 293, 72, -57);
  }
} catch (e) {
  console.log('Deposit note:', e.message);
}

// Wait for night (tick 12542) and sleep
for (let i = 0; i < 40; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  
  if (t.canSleep) {
    console.log(`canSleep=true at ${t.timeOfDay}! Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Sleeping!');
    } catch (e) {
      console.log('sleep note:', e.message);
    }
  }
  
  if (t.timeOfDay >= 23500 || t.timeOfDay < 2000) {
    if (i > 5) {
      console.log(`Morning arrived! Time: ${t.timeOfDay}`);
      break;
    }
  }
  
  if (i % 5 === 0) {
    console.log(`[t=${i*2}s] time=${t.timeOfDay}, secondsUntilNight=${t.secondsUntilNight}`);
  }
  await sleep(2000);
}

console.log('End time:', lib.time());
console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat('team: Morning! Night skipped. Alpha ready to gather food & finalize iron gear!');
