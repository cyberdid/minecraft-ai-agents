// programs/328-sleep-and-skip-night.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

const bedPos = new Vec3(294, 72, -56);
const bedBlock = bot.blockAt(bedPos);
console.log('Bed block at (294, 72, -56):', bedBlock ? bedBlock.name : 'null');

bot.chat('delta: Inside base shelter, holding for tick 12542 to sleep in Bed 2 and skip night with team!');

// Wait for sleep time (12542 - 23460)
console.log('Waiting for sleep time (12542)... current time:', bot.time.timeOfDay);
while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  await sleep(1000);
}

console.log('Sleep time reached! Time:', bot.time.timeOfDay);

// Attempt sleep
try {
  const b = bot.blockAt(bedPos) || bot.findBlocks({ matching: bl => bl.name.endsWith('_bed'), maxDistance: 5, count: 1 }).map(p => bot.blockAt(p))[0];
  if (b) {
    await bot.sleep(b);
    console.log('Sleeping in bed...');
    bot.chat('delta: In bed, sleeping to skip night!');
  }
} catch (e) {
  console.log('Sleep attempt note:', e.message);
}

// Wait until morning
while (bot.isSleeping && !isCancelled()) {
  await sleep(1000);
}

console.log('Awake! Time:', bot.time.timeOfDay, 'isDay:', bot.time.isDay);
bot.chat(`delta: Awake at dawn! Time: ${bot.time.timeOfDay}. Ready to craft gear & breach Spawner!`);
