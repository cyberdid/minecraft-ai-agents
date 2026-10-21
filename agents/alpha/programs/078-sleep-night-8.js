// programs/078-sleep-night-8.js
// Sleep through night 8 until dawn (tick 23460 / 0)

console.log('Sleeping through night 8. Starting tick:', lib.time().timeOfDay);

bot.chat('alpha: Bedtime at base! Going to sleep in bed.');

while (!isCancelled()) {
  const t = lib.time();
  
  // Dawn is after 23460 or early morning (< 1000 after midnight wrap)
  if (t.timeOfDay >= 23460 || (t.timeOfDay > 0 && t.timeOfDay < 1000)) {
    console.log(`Dawn reached! timeOfDay: ${t.timeOfDay}`);
    break;
  }
  
  if (t.canSleep) {
    try {
      console.log(`Calling sleepInBed() at tick ${t.timeOfDay}...`);
      await lib.sleepInBed();
      console.log('Sleeping in bed...');
    } catch (e) {
      // already in bed or cannot sleep yet
      if (!e.message.includes('already')) {
        console.log('Sleep attempt note:', e.message);
      }
    }
  }
  
  await sleep(4000);
}

try {
  await bot.wake();
} catch (e) {}

console.log('Dawn verified! timeOfDay:', lib.time().timeOfDay, '| health:', bot.health, '| food:', bot.food);
bot.chat(`alpha: Day 9 dawn reached! Health: ${Math.round(bot.health)}/20.`);
