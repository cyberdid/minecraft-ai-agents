// programs/110-climb-to-base-and-sleep.js
console.log('--- CLIMB TO BASE ROOM & SLEEP WITH TEAM ---');
console.log('Current pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Tower up from y=68 to y=72 using tuff blocks
console.log('Towering up 4 blocks to surface level...');
await bot.equip(mcData.itemsByName.tuff.id, 'hand');

for (let i = 0; i < 4 && bot.entity.position.y < 72 && !isCancelled(); i++) {
  const p = bot.entity.position.floored();
  bot.setControlState('jump', true);
  await sleep(200);
  const below = bot.blockAt(p);
  if (below) {
    try {
      await bot.placeBlock(below, new Vec3(0, 1, 0));
    } catch (e) {}
  }
  bot.setControlState('jump', false);
  await sleep(200);
  console.log(`Climb step ${i + 1}: y=${bot.entity.position.y.toFixed(1)}`);
}

console.log('At pos after tower:', lib.fmt(bot.entity.position));

// 2. Step into base room at (293.5, 72.0, -56.0)
console.log('Moving into base room at beds...');
try {
  await lib.walkTo(293.5, -56.0);
} catch (e) {}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// Close base door
try {
  const door = bot.blockAt(new Vec3(294, 72, -54));
  if (door && door.name.includes('door')) {
    // If open, close it
    await lib.door(294, 72, -54, false);
    console.log('Base door closed!');
  }
} catch (e) {}

bot.chat('Gamma is inside base at Bed! Ready to sleep at 12542 to skip night with Alpha & Beta.');

// 3. Wait for sleep time (12542)
console.log('Waiting for timeOfDay >= 12542... current:', bot.time.timeOfDay);
while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  await sleep(1000);
}

// 4. Sleep in bed
console.log('Attempting sleep in bed...');
try {
  await lib.sleepInBed();
  console.log('SLEPT IN BED!');
} catch (e) {
  console.log('Sleep note:', e.message);
}

console.log('Time after sleep attempt:', JSON.stringify(lib.time()));
console.log('Final pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
