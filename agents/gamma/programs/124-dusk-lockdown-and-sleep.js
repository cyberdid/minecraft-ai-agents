// programs/124-dusk-lockdown-and-sleep.js
console.log('--- DUSK LOCKDOWN & BASE SLEEP ---');
console.log('Current pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Close base door at (294, 72, -54)
try {
  const door = bot.blockAt(new Vec3(294, 72, -54));
  if (door && door.name.includes('door')) {
    await lib.door(294, 72, -54, false);
    console.log('Base door closed!');
  }
} catch (e) {
  console.log('Door close note:', e.message);
}

bot.chat('Team: Sunset at base! Alpha, Beta, Gamma let us sleep in base beds at 12542 to skip night safely.');

// 2. Wait for sleep time (12542)
console.log('Waiting for timeOfDay >= 12542... current:', bot.time.timeOfDay);
while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  await sleep(1000);
}

// 3. Sleep in bed
console.log('Attempting sleep in bed...');
try {
  await lib.sleepInBed();
  console.log('SLEPT IN BED!');
} catch (e) {
  console.log('Sleep note:', e.message);
}

console.log('Time after sleep attempt:', JSON.stringify(lib.time()));
console.log('Final pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
