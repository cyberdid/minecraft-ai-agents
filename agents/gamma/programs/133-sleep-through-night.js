// programs/133-sleep-through-night.js
console.log('--- NIGHT TIME SLEEP PROTOCOL ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time start:', JSON.stringify(lib.time()));

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}`);
  }
}

// 1. Stand near the bed at (294, 72, -56)
console.log('Positioning near bed (294, 72, -56)...');
try {
  await lib.goTo(294, 72, -56, 1, { timeoutMs: 10000 });
} catch (e) {}

// 2. Wait until canSleep is true
console.log('Waiting for sunset/canSleep (12542 ticks)...');
while (!lib.time().canSleep && !isCancelled()) {
  const t = lib.time();
  if (t.secondsUntilNight % 15 === 0 || t.secondsUntilNight < 10) {
    console.log(`Time: ${t.timeOfDay}, canSleep: ${t.canSleep}, seconds until night: ${t.secondsUntilNight}`);
  }
  await sleep(1000);
}

console.log('canSleep is TRUE! Sleeping in bed...');
bot.chat('Night arrived! gamma sleeping in bed to skip night. Alpha, Delta, please sleep too!');

try {
  const result = await lib.sleepInBed();
  console.log('sleepInBed result:', result);
} catch (e) {
  console.log('sleepInBed error:', e.message);
  // Retry with direct bed activation
  const bed = bot.findBlock({ matching: b => bot.isABed(b), maxDistance: 6 });
  if (bed) {
    console.log('Directly activating bed at', lib.fmt(bed.position));
    await bot.sleep(bed);
  }
}

// 3. Wait while sleeping or until dawn
console.log('Waiting for morning (dawn)...');
const tStart = Date.now();
while (Date.now() - tStart < 30000 && !isCancelled()) {
  await sleep(1000);
  const t = lib.time();
  if (t.timeOfDay < 12000 || t.phase === 'day') {
    console.log(`Morning achieved! timeOfDay=${t.timeOfDay}, phase=${t.phase}`);
    break;
  }
}

console.log('Status after sleep: time=', JSON.stringify(lib.time()));
bot.chat(`gamma awake! Time: ${lib.time().timeOfDay} (${lib.time().phase}). Health: ${bot.health}/20, Food: ${bot.food}/20.`);
