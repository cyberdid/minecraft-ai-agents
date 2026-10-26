// programs/279-sleep-night-and-plan-lava-lake.js
console.log('=== Step 37: Close door, sleep night with Alpha, prep morning lava trip ===');

// 1. Close door
try {
  await lib.door(294, 72, -54, false);
  console.log('Door closed.');
} catch (e) {}

// 2. Wait for bedtime (tick 12542)
console.log('Waiting for sleep tick 12542...');
const deadline = Date.now() + 60000;
let slept = false;

while (Date.now() < deadline && !isCancelled()) {
  const t = lib.time();
  if (t.canSleep && !slept) {
    console.log(`Sleep tick reached (${t.timeOfDay}). Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Slept in bed!');
      slept = true;
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
  await sleep(1500);
  if (slept && lib.time().phase === 'day') {
    console.log('Morning arrived!');
    break;
  }
}

console.log('Beta pos:', lib.fmt(bot.entity.position));
console.log('Alpha at:', bot.players['alpha']?.entity ? lib.fmt(bot.players['alpha'].entity.position) : 'in base');
console.log('Time now:', lib.time());

bot.chat('alpha: Morning! The 75-source lava lake is at (286, 18, 8). Let us quench it with water bucket and mine 10 obsidian for portal!');
