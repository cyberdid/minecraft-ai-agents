// programs/471-sleep-through-night.js
console.log('=== Step: Sleep through the Night at Base ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'Night in:', bot.time.nightIn);

// 1. Locate beds in base
const bedPositions = bot.findBlocks({
  matching: b => b.name.endsWith('_bed'),
  maxDistance: 4,
  count: 2
});
console.log(`Found ${bedPositions.length} bed blocks nearby`);

// 2. Loop until night arrives and sleep
let slept = false;
for (let i = 0; i < 45; i++) {
  if (isCancelled()) break;
  const t = bot.time.timeOfDay;
  const isNight = t >= 12542 && t <= 23460;
  
  if (isNight && !bot.isSleeping) {
    for (const bp of bedPositions) {
      try {
        const bed = bot.blockAt(bp);
        console.log(`Sleeping in bed at ${lib.fmt(bp)}...`);
        await bot.sleep(bed);
        console.log('Successfully sleeping in bed!');
        slept = true;
        break;
      } catch (err) {
        // Sleep might throw if other player already in bed or daytime
      }
    }
  }
  
  // If time rolled over to dawn (< 1000 or < 6000)
  if (t < 1000 && i > 3) {
    console.log(`Dawn! Time is now ${t}.`);
    break;
  }
  
  await sleep(1000);
}

if (bot.isSleeping) {
  try {
    await bot.wake();
  } catch (e) {}
}

console.log('Final status: Time=', bot.time.timeOfDay, 'HP=', bot.health, 'Food=', bot.food);
bot.chat(`beta: Dawn reached at base! Time=${bot.time.timeOfDay}, HP=${bot.health}. Ready for morning expedition!`);
