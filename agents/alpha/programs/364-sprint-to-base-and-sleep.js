// programs/364-sprint-to-base-and-sleep.js
console.log('=== Program 364: Sprint to Base & Sleep Through Night ===');

console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
console.log('Time until night:', lib.time().secondsUntilNight, 's');

// 1. Sprint towards base door outside: (294.5, 72, -52)
console.log('Sprinting back to base...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 30000 });
} catch (e) {
  console.log('Direct goTo note:', e.message);
  // Try stage approach if needed
  try {
    await lib.goToXZ(294.5, -52, { timeoutMs: 25000 });
  } catch (e2) {
    console.log('goToXZ fallback note:', e2.message);
  }
}

// 2. Pass through door into base
console.log('Entering base...');
try {
  await globalThis.passDoorIn();
  console.log('Inside base!');
} catch (e) {
  console.log('passDoorIn error:', e.message);
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {
    console.log('goThroughDoor error:', e2.message);
  }
}

console.log('Alpha at base:', lib.fmt(bot.entity.position));

// 3. Coordinate sleep with team
bot.chat('team: Alpha arrived in base! Ready to sleep.');

for (let i = 0; i < 45; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.canSleep) {
    console.log(`canSleep=true at tick ${t.timeOfDay}! Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Sleeping in bed!');
      break;
    } catch (err) {
      console.log('sleepInBed note:', err.message);
    }
  }
  await sleep(1000);
}

// 4. Wait for morning
for (let i = 0; i < 15; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.timeOfDay >= 23500 || t.timeOfDay < 2000) {
    console.log(`Morning arrived! Tick: ${t.timeOfDay}`);
    break;
  }
  await sleep(1000);
}

console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat('team: Good morning! Alpha is 20/20 HP & food with full iron armor. Time for Nether expedition!');
