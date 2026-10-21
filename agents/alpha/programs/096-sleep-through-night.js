// programs/096-sleep-through-night.js
// Sleep safely through night in bed at (294, 72, -56) until dawn

console.log('Sleeping through night from tick:', lib.time().timeOfDay);

// Ensure base door is firmly closed
await lib.door(294, 72, -54, false);

try {
  await lib.sleepInBed();
  console.log('In bed sleeping...');
} catch (e) {
  console.log('Sleep attempt note:', e.message);
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

bot.chat('alpha: Day 10 dawn! Ready for iron mining and nether portal.');

const finalTime = lib.time();
return { time: finalTime, hostiles };
