// programs/327-sleep-through-night.js
console.log('=== Program 327: Sleep Through Night in Base ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Time:', lib.time());

// Wait for canSleep
for (let i = 0; i < 15; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.canSleep) {
    console.log(`Time is ${t.timeOfDay} (canSleep=true)! Sleeping in Bed 1...`);
    try {
      await lib.sleepInBed();
      console.log('Sleeping!');
    } catch (e) {
      console.log('sleepInBed note:', e.message);
    }
    break;
  }
  console.log(`[t=${i*2}s] time=${t.timeOfDay}, secondsUntilNight=${t.secondsUntilNight}`);
  await sleep(2000);
}

// Wait for morning
for (let i = 0; i < 10; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.timeOfDay >= 23500 || t.timeOfDay < 12000) {
    console.log('Morning! Day has arrived:', t.timeOfDay);
    break;
  }
  await sleep(2000);
}

bot.chat('team: Alpha ready in base for day actions. Next: Gather iron on East hill for Milestone 3 full iron armor!');
