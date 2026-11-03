console.log('Starting sleep check program...');
console.log('Current status:', lib.status());

while (!lib.time().canSleep) {
  const t = lib.time();
  console.log(`Waiting for night: time=${t.timeOfDay}, secondsUntilNight=${t.secondsUntilNight}`);
  if (t.secondsUntilNight <= 0 || t.canSleep) break;
  const waitMs = Math.min(5000, Math.max(1000, (t.secondsUntilNight - 2) * 1000));
  await sleep(Math.min(waitMs, 5000));
}

console.log('Night reached or canSleep=true! Time:', bot.time.timeOfDay);
bot.chat('Beta sleeping in base bed to skip night');

try {
  await lib.sleepInBed();
  console.log('Successfully went to bed!');
} catch (e) {
  console.log('sleepInBed error:', e.message);
}

// Wait up to 10 seconds to see if night skips
for (let i = 0; i < 10; i++) {
  await sleep(1000);
  const t = lib.time();
  console.log(`Current timeOfDay: ${t.timeOfDay}, phase: ${t.phase}`);
  if (t.phase === 'day' && t.timeOfDay < 2000) {
    console.log('Night successfully skipped to morning!');
    break;
  }
}
