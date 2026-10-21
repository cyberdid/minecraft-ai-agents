// programs/079-sleep-to-dawn.js
// Sleep safely through the second half of the night until dawn (tick 23460 / 0)

console.log('Sleeping through night from tick:', lib.time().timeOfDay);

try {
  await lib.sleepInBed();
} catch (e) {
  console.log('Sleep note:', e.message);
}

let lastLog = Date.now();
while (!isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay >= 0 && t.timeOfDay < 1000)) {
    console.log(`Dawn reached! timeOfDay: ${t.timeOfDay}`);
    break;
  }
  if (Date.now() - lastLog > 30000) {
    console.log(`Night vigil progress: timeOfDay ${t.timeOfDay}, hostiles in 16: ${lib.hostiles(16).length}`);
    lastLog = Date.now();
  }
  await sleep(4000);
}

try {
  await bot.wake();
} catch (e) {}

const hostiles = lib.hostiles(16);
console.log('Hostiles outside at dawn:', JSON.stringify(hostiles));

bot.chat('alpha: Day 9 dawn! Skeletons and zombies burning.');

const finalTime = lib.time();
return { time: finalTime, hostiles };
