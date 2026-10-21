// programs/132-sleep-together-night12.js
// 1. Ensure door is closed
// 2. Sleep in bed 1 when night falls
// 3. Skip night together with Beta to dawn!

console.log('alpha standing by bed. Current tick:', lib.time().timeOfDay, '| night in:', lib.time().secondsUntilNight);

// Ensure base door is firmly closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

bot.chat('alpha: Base door closed. I am sleeping in bed 1 at (294, 72, -56). Beta, sleep in bed 2 so we skip the night to dawn!');

while (!isCancelled()) {
  const t = lib.time();
  
  if (t.canSleep) {
    try {
      console.log('Sleeping in bed 1...');
      await lib.sleepInBed();
    } catch (e) {}
  }
  
  if (t.timeOfDay >= 23460 || (t.timeOfDay > 0 && t.timeOfDay < 1000)) {
    console.log(`Dawn reached! timeOfDay: ${t.timeOfDay}`);
    break;
  }
  
  await sleep(3000);
}

try {
  await bot.wake();
} catch (e) {}

const tDawn = lib.time();
console.log('Dawn verified! timeOfDay:', tDawn.timeOfDay, '| phase:', tDawn.phase);
bot.chat(`alpha: Day 13 dawn reached! Rested and ready for boots, diamonds, and portal.`);
