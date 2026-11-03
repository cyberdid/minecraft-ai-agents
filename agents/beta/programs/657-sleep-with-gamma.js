// programs/657-sleep-with-gamma.js
console.log('=== Program 657: Sleep in Base Bed with Gamma to Skip Night ===');
console.log('Current status:', lib.status());

while (!lib.time().canSleep) {
  const t = lib.time();
  console.log(`Waiting for sleep tick 12542: time=${t.timeOfDay}, secondsUntilNight=${t.secondsUntilNight}`);
  if (t.secondsUntilNight <= 0 || t.canSleep) break;
  await sleep(1000);
}

console.log('Sleeping tick reached! Time:', bot.time.timeOfDay);
bot.chat('Beta sleeping in bed with Gamma to skip night!');

try {
  await lib.sleepInBed();
  console.log('Successfully went to bed!');
} catch (e) {
  console.log('sleepInBed error:', e.message);
  // Manual bed right click if lib.sleepInBed threw
  const beds = bot.findBlocks({ matching: b => b.name.includes('bed'), maxDistance: 6 });
  if (beds.length > 0) {
    const b = bot.blockAt(beds[0]);
    await bot.activateBlock(b);
    console.log('Right-clicked bed at', beds[0]);
  }
}

// Wait up to 10 seconds for morning transition
for (let i = 0; i < 10; i++) {
  await sleep(1000);
  const t = lib.time();
  console.log(`Current timeOfDay: ${t.timeOfDay}, phase: ${t.phase}`);
  if (t.phase === 'day' && t.timeOfDay < 2000) {
    console.log('MORNING REACHED! Night skipped!');
    bot.chat('beta: Good morning! Night skipped! Gearing up for Spawner assault!');
    break;
  }
}

return {
  pos: bot.entity.position,
  time: bot.time.timeOfDay,
  phase: lib.time().phase,
  inv: lib.inv()
};
