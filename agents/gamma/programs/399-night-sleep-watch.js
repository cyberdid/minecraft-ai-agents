// programs/399-night-sleep-watch.js
console.log('=== NIGHT SLEEP WATCH ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', JSON.stringify(lib.time()));

// 1. If before 12542, wait until sleep is allowed
let t = lib.time();
if (t.timeOfDay < 12542) {
  const waitMs = Math.max(1000, (12542 - t.timeOfDay) * 50);
  console.log(`Waiting ${waitMs}ms until 12542 (canSleep)...`);
  await sleep(waitMs);
}

// 2. Announce and sleep
bot.chat('gamma: Dusk arrived. Getting into bed to skip night.');
let slept = false;
for (let attempt = 1; attempt <= 10 && !isCancelled(); attempt++) {
  t = lib.time();
  if (t.phase === 'day' && t.timeOfDay < 12000) {
    console.log('Dawn has arrived! Night skipped successfully!');
    bot.chat('gamma: Dawn! Night successfully skipped.');
    slept = true;
    break;
  }
  try {
    console.log(`Sleep attempt ${attempt}...`);
    await lib.sleepInBed();
    console.log('Bot is in bed!');
  } catch (e) {
    console.log(`sleepInBed attempt ${attempt} note:`, e.message);
  }
  await sleep(3000);
}

await lib.equipWeapon();
console.log('Ending time:', JSON.stringify(lib.time()));
console.log('Ending status:', JSON.stringify(lib.status()));
