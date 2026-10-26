// programs/358-sleep-night-with-team.js
console.log('=== Program 358: Sleep Night with Team in Base ===');
console.log('Alpha gear:', JSON.stringify(lib.tools()));
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Time:', lib.time());

// Announce Milestone 3 achievement
bot.chat('team: MILESTONE 3 ACHIEVED FOR ALPHA! Wearing full iron armor (helmet, chestplate, leggings, boots)!');

// Wait for night (tick 12542) and sleep
for (let i = 0; i < 20; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.canSleep) {
    console.log(`canSleep=true at ${t.timeOfDay}! Sleeping in Bed 1...`);
    try {
      await lib.sleepInBed();
      console.log('Sleeping in bed!');
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

console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat('team: Good morning! Full iron armor ready. Time to prepare for Nether expedition!');
