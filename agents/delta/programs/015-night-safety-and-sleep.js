// programs/015-night-safety-and-sleep.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time start:', JSON.stringify(lib.time()));

// Ensure door is closed
const door = bot.blockAt(new Vec3(294, 72, -54));
if (door && door.name.includes('door') && door.getProperties().open) {
  console.log('Closing door...');
  await bot.activateBlock(door);
}

// Set spawn on Bed 2
try {
  await lib.setSpawn();
  console.log('Spawn set at Bed 2!');
} catch (e) {
  console.log('setSpawn:', e.message);
}

// Report players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

bot.chat('delta: Bed 2 active in base. Spawn set. Waiting for 12542 to sleep if safe!');

// Wait for sleep time if night is falling
while (!isCancelled() && lib.time().timeOfDay < 12542 && lib.time().secondsUntilNight > 0) {
  await sleep(1000);
}

console.log('Time at sleep check:', JSON.stringify(lib.time()));

if (lib.time().canSleep) {
  console.log('Attempting sleep in Bed 2...');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (err) {
    console.log('sleepInBed:', err.message);
  }
}

console.log('Time end:', JSON.stringify(lib.time()));
