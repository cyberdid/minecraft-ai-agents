// programs/039-night-vigil-to-day5.js
// Wait safely inside base with beta until dawn (tick 23460)

console.log('alpha waiting safely inside base at:', lib.fmt(bot.entity.position));
console.log('Current timeOfDay:', lib.time().timeOfDay);

bot.chat('alpha: Waiting safely inside base until dawn (tick 23460) to mine 40+ iron for full armor.');

let lastReport = 0;
while (!isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay >= 0 && t.timeOfDay < 12000)) {
    console.log(`Dawn reached! timeOfDay: ${t.timeOfDay}, phase: ${t.phase}`);
    break;
  }
  if (Date.now() - lastReport > 25000) {
    console.log(`Night progress: timeOfDay ${t.timeOfDay}, hostiles in 16: ${lib.hostiles(16).length}`);
    lastReport = Date.now();
  }
  await sleep(4000);
}

const hostiles = lib.hostiles(16);
console.log('Hostiles outside at dawn:', JSON.stringify(hostiles));

bot.chat('alpha: Day 5 dawn! Starting iron armor mining run.');

const finalTime = lib.time();
return { time: finalTime, hostiles };
