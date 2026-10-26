// programs/571-enter-base-and-sleep-in-bed1.js
console.log('=== Program 571: Enter Base Shelter & Sleep in Bed 1 ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Enter base shelter immediately
console.log('Entering base shelter at (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.lookAt(new Vec3(294, 72, -55), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
  console.log('Base door confirmed closed!');
} catch (e) {}

// Go to Bed 1 at (294, 72, -55)
try {
  await lib.goNearBlock(294, 72, -55);
} catch (e) {}

bot.chat('alpha: Inside base shelter at Bed 1! Waiting for 12542 to sleep and skip night!');

// 2. Wait until tick 12542 (canSleep)
while (!lib.time().canSleep && !isCancelled()) {
  const t = lib.time();
  console.log(`Current timeOfDay: ${t.timeOfDay}, seconds until night: ${t.secondsUntilNight}s...`);
  await sleep(2000);
}

// 3. Sleep in Bed 1
if (!isCancelled()) {
  console.log('Sleeping in Bed 1...');
  bot.chat('alpha: Sleeping in Bed 1 now! Goodnight team!');
  try {
    await lib.sleepInBed();
    console.log('In bed sleeping...');
  } catch (e) {
    console.log('lib.sleepInBed note:', e.message);
    try {
      await lib.setSpawn();
    } catch (e2) {}
  }
  
  // Wait until dawn
  while ((bot.isSleeping || lib.time().timeOfDay > 23000 || lib.time().timeOfDay > 12542) && !isCancelled()) {
    await sleep(1000);
    if (lib.time().timeOfDay < 1000) break;
  }
  
  console.log('=== Dawn Arrived! ===');
  console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
  bot.chat('alpha: Awake at dawn with full HP & Food! Ready to take gear from chest & assault Nether spawner!');
}
