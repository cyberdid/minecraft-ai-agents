// programs/058-sleep-to-dawn-day8.js
// Sleep safely through the night until dawn (tick 23460)

console.log('Sleeping through night from tick:', lib.time().timeOfDay);

try {
  await lib.sleepInBed();
} catch (e) {
  console.log('Sleep note:', e.message);
}

// Loop until dawn
let lastLog = 0;
while (!isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay >= 0 && t.timeOfDay < 12000)) {
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

bot.chat('alpha: Day 8 dawn! Mining final 7 iron for chestplate to complete Milestone 3 full armor.');

const finalTime = lib.time();
return { time: finalTime, hostiles };
