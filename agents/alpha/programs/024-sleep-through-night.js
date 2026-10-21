// programs/024-sleep-through-night.js
// Sleep in bed through the night until dawn (tick 23460 or day phase)

console.log('Sleeping through night from tick:', lib.time().timeOfDay);

try {
  await lib.sleepInBed();
} catch (e) {
  console.log('Sleep status:', e.message);
}

// Loop until dawn
while (!isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay >= 0 && t.timeOfDay < 12000)) {
    console.log(`Dawn reached! timeOfDay: ${t.timeOfDay}, phase: ${t.phase}`);
    break;
  }
  await sleep(4000);
}

try {
  await bot.wake();
} catch (e) {}

const hostiles = lib.hostiles(16);
console.log('Hostiles within 16:', JSON.stringify(hostiles));

bot.chat('alpha: Dawn arrived! Heading out to mine stone and iron on surface.');

const finalTime = lib.time();
console.log('Final time:', finalTime);

return {
  time: finalTime,
  hostiles: hostiles,
  inv: lib.inv()
};
