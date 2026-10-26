// programs/563-wait-and-sleep-in-bed.js
console.log('=== Program 563: Wait for Night & Sleep in Bed ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Ensure base door is closed
try {
  await lib.door(294, 72, -54, false);
  console.log('Base door closed!');
} catch (e) {
  console.log('Door check note:', e.message);
}

// Stand next to Bed 1 at (294, 72, -55)
try {
  await lib.goNearBlock(294, 72, -55);
} catch (e) {}

bot.chat('alpha: Inside base shelter! Waiting for 12542 to sleep and skip night!');

// Loop until canSleep
while (!lib.time().canSleep && !isCancelled()) {
  const t = lib.time();
  console.log(`Current timeOfDay: ${t.timeOfDay}, seconds until night: ${t.secondsUntilNight}s...`);
  await sleep(3000);
}

if (isCancelled()) {
  console.log('Cancelled before sleep.');
} else {
  console.log('Night has arrived (canSleep is true)! Sleeping in bed...');
  bot.chat('alpha: Sleeping in base bed now! Skip night teammates!');
  try {
    await lib.sleepInBed();
    console.log('In bed sleeping...');
  } catch (e) {
    console.log('lib.sleepInBed note:', e.message);
    try {
      await lib.setSpawn();
    } catch (e2) {}
  }
  
  // Wait until wake up at dawn
  while ((bot.isSleeping || lib.time().timeOfDay > 23000 || lib.time().timeOfDay > 12542) && !isCancelled()) {
    await sleep(1000);
    if (lib.time().timeOfDay < 1000) break;
  }
  
  console.log('Awake at dawn! Current time:', lib.time().timeOfDay);
  bot.chat('alpha: Awake at dawn! Full daylight ahead! Ready to gear up and march to Nether frontline!');
}
