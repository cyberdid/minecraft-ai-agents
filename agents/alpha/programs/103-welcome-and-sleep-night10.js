// programs/103-welcome-and-sleep-night10.js
// Stand near bed 1 at (293, 72, -56), wait for Beta to arrive and equip gear, then sleep when night falls

console.log('alpha at:', lib.fmt(bot.entity.position), '| time:', lib.time().timeOfDay, '| night in:', lib.time().secondsUntilNight);

// Stand at bed 1
await lib.walkTo(293.5, -56);

let betaNearby = false;
let lastLog = Date.now();

while (!isCancelled()) {
  const t = lib.time();
  
  // Check if Beta is inside base
  const beta = bot.players.beta?.entity;
  if (beta && beta.position.distanceTo(bot.entity.position) < 5 && !betaNearby) {
    console.log('Beta has arrived at base! Position:', lib.fmt(beta.position));
    bot.chat('alpha: Welcome back beta! Take the gear from the chest and let us sleep through the night together.');
    betaNearby = true;
  }
  
  // Sleep when night arrives
  if (t.canSleep) {
    try {
      console.log('Sleeping in bed 1 at tick:', t.timeOfDay);
      await lib.sleepInBed();
    } catch (e) {}
  }
  
  // Break on dawn
  if (t.timeOfDay >= 23460 || (t.timeOfDay > 0 && t.timeOfDay < 1000)) {
    console.log(`Dawn reached! timeOfDay: ${t.timeOfDay}`);
    break;
  }
  
  if (Date.now() - lastLog > 20000) {
    console.log(`Progress: time ${t.timeOfDay}, night in ${t.secondsUntilNight}s, canSleep: ${t.canSleep}`);
    lastLog = Date.now();
  }
  
  await sleep(3000);
}

try {
  await bot.wake();
} catch (e) {}

console.log('Dawn reached! Time:', lib.time().timeOfDay);
bot.chat('alpha: Day 11 dawn! Both players rested and ready for iron & diamonds.');
