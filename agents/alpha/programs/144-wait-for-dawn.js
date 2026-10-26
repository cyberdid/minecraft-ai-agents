// programs/144-wait-for-dawn.js
console.log('--- Sheltered in base waiting for dawn ---');
console.log('Current time:', lib.time().timeOfDay, '| Health:', bot.health, '| Food:', bot.food);

// Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

while (!isCancelled()) {
  const t = lib.time().timeOfDay;
  if (t >= 23460 || t < 1000) {
    console.log(`Dawn arrived! Time is ${t}.`);
    break;
  }
  
  // Print status every ~10s
  console.log(`Waiting for dawn... Time: ${t} (${23460 - t} ticks left, ~${Math.round((23460 - t) / 20)}s)`);
  await sleep(10000);
}

// Check hostiles outside before opening or leaving
const hostiles = lib.hostiles(16);
console.log('Hostiles within 16 blocks:', JSON.stringify(hostiles));

bot.chat('alpha: Dawn has broken! Time to hunt food, gather wool for 2nd bed, and mine iron.');
console.log('Ready for daytime actions!');
