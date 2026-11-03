// programs/619-safe-sleep-night-skip.js
console.log('=== Program 619: Urgent Night Protocol & Sleep at Bed 2 ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Enter base shelter through door (294, 72, -54)
console.log('Passing through base door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base shelter at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door pass note:', e.message);
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(293, 72, -55, 1, { dig: false });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 2. Set spawn at Bed 2 (293, 72, -56)
try {
  await lib.setSpawn();
  console.log('Spawn confirmed at Bed 2!');
} catch (e) {}

// 3. Wait until sleep time (>= 12542)
console.log('Waiting for sleep time (12542)... current:', bot.time.timeOfDay);
while (bot.time.timeOfDay < 12542 && bot.time.timeOfDay > 6000) {
  await sleep(100);
}

// 4. Sleep in bed
console.log('Sleeping in bed...');
try {
  await lib.sleepInBed();
  console.log('lib.sleepInBed successful!');
} catch (e) {
  console.log('sleepInBed note:', e.message);
  const bedBlock = bot.blockAt(new Vec3(293, 72, -56));
  if (bedBlock) {
    try {
      await bot.activateBlock(bedBlock);
      console.log('Activated Bed 2 at (293, 72, -56)!');
    } catch (e2) {
      console.log('Bed activate note:', e2.message);
    }
  }
}

// 5. Wait for dawn or night skip
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.time.timeOfDay < 1000 || bot.time.timeOfDay > 23000) {
    console.log('DAWN REACHED! Morning time:', bot.time.timeOfDay);
    break;
  }
}

return {
  time: bot.time.timeOfDay,
  pos: bot.entity.position,
  inv: lib.inv(),
  health: bot.health,
  food: bot.food
};
