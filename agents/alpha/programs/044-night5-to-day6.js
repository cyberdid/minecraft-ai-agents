// programs/044-night5-to-day6.js
// Sleep safely through Night 5 until dawn (tick 23460)

console.log('Sleeping through Night 5 from tick:', lib.time().timeOfDay);

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
    console.log(`Night 5 progress: timeOfDay ${t.timeOfDay}, hostiles in 16: ${lib.hostiles(16).length}`);
    lastLog = Date.now();
  }
  await sleep(4000);
}

try {
  await bot.wake();
} catch (e) {}

const hostiles = lib.hostiles(16);
console.log('Hostiles at dawn:', JSON.stringify(hostiles));

bot.chat('alpha: Day 6 dawn! Heading to east hill with fresh iron pickaxe to mine 35 iron for full armor.');

const finalTime = lib.time();
return { time: finalTime, hostiles };
