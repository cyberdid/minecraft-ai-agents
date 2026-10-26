// programs/150-shelter-night-and-plan-portal.js
console.log('--- Night Shelter & Portal Planning ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Time:', lib.time().timeOfDay, 'Night in:', lib.time().secondsUntilNight);

// Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// Chat with Beta
bot.chat('alpha: I have bucket, shield, full iron armor. No diamond pickaxe. Lava pool is at (333, 62, -78). Let us coordinate on obsidian.');

// Wait until dawn (tick 23460) safely inside base
console.log('Sheltering until dawn...');
while (!isCancelled()) {
  const cur = lib.time().timeOfDay;
  if (cur >= 23460 || cur < 1000) {
    console.log(`Dawn reached! Time: ${cur}`);
    break;
  }
  await sleep(10000);
  console.log(`Sheltered in base... Time: ${cur} (${23460 - cur} ticks left)`);
}

console.log('Dawn broken! Hostiles near:', JSON.stringify(lib.hostiles(16)));
bot.chat('alpha: Dawn has broken! Safe to gather water and obsidian for Nether portal.');
