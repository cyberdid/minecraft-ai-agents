// programs/400-sleep-through-night.js
console.log('=== SLEEP THROUGH NIGHT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Time:', JSON.stringify(lib.time()));

// Wait for canSleep (tick >= 12542)
for (let i = 0; i < 30; i++) {
  const t = lib.time();
  if (t.timeOfDay >= 12542 || t.night || t.canSleep) {
    console.log(`canSleep active at tick ${t.timeOfDay}! Calling sleepInBed...`);
    try {
      bot.chat('gamma: Sleeping in bed now.');
      await lib.sleepInBed();
      console.log('In bed!');
      
      // Wait for morning
      for (let s = 0; s < 20; s++) {
        await sleep(1000);
        const cur = lib.time();
        if (cur.phase === 'day' && cur.timeOfDay < 2000) {
          console.log(`Morning arrived! Tick: ${cur.timeOfDay}`);
          bot.chat('gamma: Dawn arrived! Ready to march to Nether portal.');
          break;
        }
      }
      break;
    } catch (e) {
      console.log('sleepInBed attempt error:', e.message);
    }
  }
  await sleep(1000);
}

// Ensure spawn is set
try {
  await lib.setSpawn();
  console.log('Spawn set verified.');
} catch (e) {}

console.log('Status after night:', JSON.stringify(lib.status()));
