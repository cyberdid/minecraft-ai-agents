// programs/104-sleep-to-dawn-day11.js
// Reply to Beta and sleep until dawn (tick 23460 / 0)

console.log('Sleeping through night from tick:', lib.time().timeOfDay);

bot.chat('alpha: Yes, I am in base sleeping in bed. Chest at (293, 72, -57) has stone tools, iron leggings, and cobblestone ready for you at dawn!');

try {
  await lib.sleepInBed();
} catch (e) {
  console.log('Sleep note:', e.message);
}

let lastLog = Date.now();
while (!isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay > 0 && t.timeOfDay < 1000)) {
    console.log(`Dawn reached! timeOfDay: ${t.timeOfDay}`);
    break;
  }
  if (Date.now() - lastLog > 30000) {
    console.log(`Night progress: timeOfDay ${t.timeOfDay}, hostiles in 16: ${lib.hostiles(16).length}`);
    lastLog = Date.now();
  }
  await sleep(4000);
}

try {
  await bot.wake();
} catch (e) {}

const hostiles = lib.hostiles(16);
console.log('Hostiles outside at dawn:', JSON.stringify(hostiles));

bot.chat('alpha: Day 11 dawn! Heading out to east hill with you beta.');

const finalTime = lib.time();
return { time: finalTime, hostiles };
