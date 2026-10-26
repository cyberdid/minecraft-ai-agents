// programs/345-sleep-now.js
console.log('=== Program 345: Sleep at tick 12542 ===');
console.log('Start time:', lib.time());

// Wait until canSleep is true (tick 12542)
for (let i = 0; i < 20; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.canSleep) {
    console.log(`canSleep=true at tick ${t.timeOfDay}! Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Sleeping!');
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
    break;
  }
  await sleep(1000);
}

// Wait for morning
for (let i = 0; i < 15; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.timeOfDay >= 23500 || t.timeOfDay < 2000) {
    console.log(`Morning arrived! Time: ${t.timeOfDay}`);
    break;
  }
  await sleep(1000);
}

console.log('End time:', lib.time());
console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat('team: Good morning! Night skipped. Time to gear up and enter Nether portal!');
