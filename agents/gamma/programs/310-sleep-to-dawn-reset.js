// programs/310-sleep-to-dawn-reset.js
console.log('=== SLEEP TO DAWN FULL RESET ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Confirm spawn at bed (294, 72, -56)
try {
  await lib.setSpawn();
  console.log('Spawn locked at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 2. Check players
console.log('\n--- PLAYERS IN BASE ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  }
}

// 3. Inform Alpha in chat
bot.chat('alpha: Gamma in base with 20 HP & 20 Food. Ready to sleep at 12542 to skip night!');

// 4. Wait for sleep time (tick 12542)
console.log('Waiting for sleep time (12542)...');
while (!isCancelled()) {
  const t = lib.time();
  if (t.canSleep || t.timeOfDay >= 12542 || t.timeOfDay > 23000) {
    console.log(`Time is ${t.timeOfDay}, getting into bed...`);
    try {
      await lib.sleepInBed();
      while (!isCancelled()) {
        await sleep(1000);
        const t2 = lib.time();
        if (!t2.night && t2.timeOfDay < 12000) {
          console.log(`Woke up at dawn! timeOfDay=${t2.timeOfDay}`);
          break;
        }
      }
      break;
    } catch (e) {
      console.log('sleepInBed note:', e.message);
      await sleep(2000);
    }
  } else {
    console.log(`timeOfDay=${t.timeOfDay}, night in ${t.secondsUntilNight}s`);
    await sleep(4000);
  }
}

console.log('\n=== MORNING STATUS ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
bot.chat(`gamma awake at dawn! Ready to gather tools & cobble for Nether assault! HP: 20/20, Food: 20/20`);
