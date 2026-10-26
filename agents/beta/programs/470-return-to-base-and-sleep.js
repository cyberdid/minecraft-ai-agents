// programs/470-return-to-base-and-sleep.js
console.log('=== Step: Return to Base before Night & Sleep ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', bot.time.nightIn);

// 1. Walk to base door
try {
  await lib.goTo(294, 72, -53, 1.5);
  console.log('At base door exterior:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Path to door error:', e.message);
  await lib.goTo(294, 72, -53, 2.5);
}

// 2. Go through door into base
try {
  await lib.goThroughDoor(294, 72, -54, { close: true });
  console.log('Safely inside base at', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door pass error:', e.message);
}

// 3. Wait until night / sleep protocol
for (let t = 0; t < 60; t++) {
  if (isCancelled()) break;
  const time = bot.time.timeOfDay;
  const isNight = time >= 12542 && time <= 23460;
  
  if (isNight && !bot.isSleeping) {
    const bedPos = bot.findBlocks({
      matching: b => b.name.endsWith('_bed'),
      maxDistance: 4,
      count: 1
    })[0];
    
    if (bedPos) {
      const bed = bot.blockAt(bedPos);
      try {
        console.log(`Attempting to sleep in bed at ${lib.fmt(bedPos)}...`);
        await bot.sleep(bed);
        console.log('Sleeping peacefully in bed!');
      } catch (err) {
        // Sleep might fail if monsters nearby or bed occupied
        if (err.message.includes('monsters')) {
          console.log('Cannot sleep: monsters nearby');
        } else if (err.message.includes('occupied')) {
          console.log('Bed occupied');
        }
      }
    }
  }
  
  if (time < 12000 && t > 5) {
    console.log('Dawn has arrived! Time:', time);
    break;
  }
  
  await sleep(1000);
}

console.log('Final pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'HP:', bot.health, 'Food:', bot.food);
bot.chat(`beta: Base secure! Time=${bot.time.timeOfDay}, HP=${bot.health}, Food=${bot.food}.`);
