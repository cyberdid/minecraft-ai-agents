// programs/517-sleep-through-night.js
console.log('=== Step: Wait for 12542 & Sleep Through Night ===');
console.log('Start timeOfDay:', bot.time.timeOfDay, 'Pos:', lib.fmt(bot.entity.position));

// Scan all beds and chests within 10 blocks
const beds = bot.findBlocks({
  matching: b => b.name.includes('bed'),
  maxDistance: 10,
  count: 5
});
console.log('Found beds:', beds.map(p => `${lib.fmt(p)} (${bot.blockAt(p)?.name})`));

const chests = bot.findBlocks({
  matching: mcData.blocksByName.chest.id,
  maxDistance: 10,
  count: 5
});
console.log('Found chests:', chests.map(p => lib.fmt(p)));

// Wait until tick 12542
while (bot.time.timeOfDay < 12541 || bot.time.timeOfDay > 23458) {
  if (isCancelled()) break;
  console.log(`Waiting for night: timeOfDay is ${bot.time.timeOfDay}...`);
  await sleep(1000);
}

console.log(`Night reached! timeOfDay: ${bot.time.timeOfDay}`);

// Try to sleep in bed
if (beds.length > 0) {
  const targetBed = bot.blockAt(beds[0]);
  console.log(`Attempting to sleep in bed at ${lib.fmt(targetBed.position)}...`);
  try {
    await bot.sleep(targetBed);
    console.log('Sleeping successfully initiated! Waiting for dawn...');
    for (let i = 0; i < 15; i++) {
      await sleep(1000);
      console.log(`Sleeping... timeOfDay: ${bot.time.timeOfDay}, isSleeping: ${bot.isSleeping}`);
      if (!bot.isSleeping && bot.time.timeOfDay < 1000) {
        console.log('Dawn reached!');
        break;
      }
    }
  } catch (err) {
    console.log('Sleep failed:', err.message);
  }
}

// Wake up if still sleeping
if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

console.log('Current timeOfDay after sleep attempt:', bot.time.timeOfDay);
console.log('End pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
