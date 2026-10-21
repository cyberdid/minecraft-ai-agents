// programs/077-safe-night.js
// 1. Close base door
// 2. Deposit bones, arrows, dirt, extra leggings into chest
// 3. Sleep in bed or wait safely through night until dawn

console.log('Night vigil started. Time:', lib.time().timeOfDay, '| night in:', lib.time().secondsUntilNight);

// Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {
  console.log('Door close note:', e.message);
}

// Deposit junk
try {
  await lib.deposit({
    bone: 'all',
    arrow: 'all',
    dirt: 'all',
    egg: 'all',
    iron_leggings: 1 // keep worn, deposit extra
  }, 293, 72, -57);
} catch (e) {
  console.log('Deposit note:', e.message);
}

bot.chat('alpha: Inside base, door closed. Standing vigil / sleeping for dawn.');

// Wait until tick 12542 to attempt sleep
while (!isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay >= 0 && t.timeOfDay < 12000)) {
    console.log('Dawn reached! timeOfDay:', t.timeOfDay);
    break;
  }
  if (t.canSleep) {
    try {
      console.log('Attempting sleep in bed at tick:', t.timeOfDay);
      await lib.sleepInBed();
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
  await sleep(5000);
}

try {
  await bot.wake();
} catch (e) {}

console.log('Night ended. Alpha health:', bot.health, '| food:', bot.food, '| time:', lib.time().timeOfDay);
bot.chat('alpha: Dawn has arrived!');
