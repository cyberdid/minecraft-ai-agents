// programs/340-enter-base-and-sleep-to-dawn.js
console.log('=== ENTER BASE AND SLEEP TO DAWN ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);

// 1. Move to base entrance at (294, 72, -53)
console.log('Moving 30 blocks to base door...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000 });
} catch (e) {
  try { await lib.goToXZ(294, -53, { timeoutMs: 8000 }); } catch (e2) {}
}

// 2. Go through door into base
console.log('Entering base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
  } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Confirm spawn at bed
try {
  await lib.setSpawn();
  console.log('Spawn set at bed!');
} catch (e) {}

// 4. Sleep in bed to skip night
console.log('Sleeping in bed...');
for (let attempt = 0; attempt < 12 && !isCancelled(); attempt++) {
  const t = lib.time();
  if (t.canSleep || t.timeOfDay >= 12542 || t.timeOfDay > 23000) {
    try {
      await lib.sleepInBed();
      console.log('In bed, sleeping to skip night...');
      while (!isCancelled()) {
        await sleep(1000);
        const t2 = lib.time();
        if (!t2.night && t2.timeOfDay < 12000) {
          console.log(`Awoke at dawn! timeOfDay=${t2.timeOfDay}`);
          break;
        }
      }
      break;
    } catch (e) {
      console.log('Sleep note:', e.message);
      await sleep(2000);
    }
  } else {
    await sleep(2000);
  }
}

console.log('\n=== STATUS AT DAWN ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
bot.chat(`gamma inside base shelter! Night skipped. HP: ${bot.health}/20, Food: ${bot.food}/20. Ready to craft & conquer Spawner!`);
