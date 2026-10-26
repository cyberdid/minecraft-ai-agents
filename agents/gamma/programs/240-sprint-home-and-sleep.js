// programs/240-sprint-home-and-sleep.js
console.log('=== SPRINT HOME TO BASE & SLEEP ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Sprint back to base house
console.log('Sprinting East towards base (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 2, { timeoutMs: 50000 });
} catch (e) {
  console.log('goTo note:', e.message);
  try {
    await lib.goToXZ(294, -53, { timeoutMs: 30000 });
  } catch (e2) {
    console.log('goToXZ note:', e2.message);
  }
}

console.log('Near base! Pos:', lib.fmt(bot.entity.position));

// 2. Enter through door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door note:', e.message);
  try {
    await lib.walkTo(294.5, -55.5, 3000);
  } catch (e2) {}
}

// Ensure door is closed
try { await lib.door(294, 72, -54, false); } catch (e) {}
console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 3. Set spawn
try { await lib.setSpawn(); } catch (e) {}

// 4. Wait for canSleep and sleep
console.log('Waiting for canSleep...');
while (!isCancelled() && !lib.time().canSleep) {
  await sleep(1000);
}

if (lib.time().canSleep) {
  console.log('Sleeping in bed...');
  bot.chat('gamma sleeping in base bed to skip night!');
  try {
    await lib.sleepInBed();
    while (!isCancelled() && bot.isSleeping) {
      await sleep(1000);
    }
    console.log('Woke up! Morning arrived!');
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log('Pos at end:', lib.fmt(bot.entity.position));
console.log('Time at end:', JSON.stringify(lib.time()));
