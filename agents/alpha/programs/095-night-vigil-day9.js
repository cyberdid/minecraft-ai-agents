// programs/095-night-vigil-day9.js
// 1. Ensure door is closed
// 2. Sleep in bed from tick 12542 until dawn

console.log('Night vigil started. Starting tick:', lib.time().timeOfDay, '| night in:', lib.time().secondsUntilNight);

// Ensure base door is firmly closed
await lib.door(294, 72, -54, false);
console.log('Door closed.');

bot.chat('alpha: Closing base door for night. Going to sleep in bed.');

while (!isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay > 0 && t.timeOfDay < 1000)) {
    console.log(`Dawn reached! timeOfDay: ${t.timeOfDay}`);
    break;
  }
  if (t.canSleep) {
    try {
      await lib.sleepInBed();
    } catch (e) {}
  }
  await sleep(4000);
}

try {
  await bot.wake();
} catch (e) {}

const tFinal = lib.time();
console.log('Dawn verified! timeOfDay:', tFinal.timeOfDay, '| health:', bot.health, '| food:', bot.food);
bot.chat(`alpha: Day 10 dawn reached! Ready for portal construction.`);
