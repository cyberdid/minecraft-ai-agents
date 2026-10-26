// programs/509-sleep-to-dawn-for-shields.js
console.log('=== Step: Set Spawn & Sleep to Dawn with Delta & Gamma ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'Night in:', bot.time.nightIn);

// 1. Set spawn at bed
try {
  await lib.setSpawn();
  console.log('SUCCESS: Bed respawn point confirmed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 2. Find base beds
const beds = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 4, count: 2 });
console.log(`Found ${beds.length} beds nearby`);

// 3. Sleep loop: wait for night (12542) and sleep
for (let t = 0; t < 50; t++) {
  if (isCancelled()) break;
  const time = bot.time.timeOfDay;
  const isNight = time >= 12542 && time <= 23460;
  
  if (isNight && !bot.isSleeping) {
    for (const bp of beds) {
      try {
        const bed = bot.blockAt(bp);
        console.log(`Sleeping in bed at ${lib.fmt(bp)}...`);
        await bot.sleep(bed);
        console.log('Successfully sleeping in bed!');
        break;
      } catch (err) {}
    }
  }
  
  // Dawn rolled over
  if (time < 1000 && t > 5) {
    console.log('DAWN ARRIVED! Time is now', time);
    break;
  }
  
  await sleep(1000);
}

if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

console.log('Final status: Time=', bot.time.timeOfDay, 'HP=', bot.health, 'Food=', bot.food);
bot.chat(`beta: Dawn arrived! HP=${bot.health}, Food=${bot.food}. Commencing shield and iron gear production!`);
