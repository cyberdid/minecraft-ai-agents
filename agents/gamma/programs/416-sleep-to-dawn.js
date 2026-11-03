// programs/416-sleep-to-dawn.js
console.log('=== WAIT FOR NIGHT & SLEEP TO DAWN ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

// If outdoors, enter base
if (bot.entity.position.z > -53.5) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}
}

// Find bed
const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
console.log('Bed found nearby:', bed ? lib.fmt(bed.position) : 'none');

// Sleep loop until dawn (timeOfDay < 1000 or night in > 500)
const deadline = Date.now() + 120000;
while (Date.now() < deadline && !isCancelled()) {
  const t = bot.time.timeOfDay;
  const canSleep = t >= 12542 && t <= 23460;
  if (t < 1000 || t > 23500) {
    console.log('Dawn arrived! Time:', t);
    break;
  }
  if (canSleep && bed) {
    try {
      console.log('Sleeping in bed...');
      await bot.sleep(bed);
      console.log('Sleeping!');
      await sleep(5000);
    } catch (e) {
      // already in bed or another player using bed
      console.log('Sleep note:', e.message);
    }
  }
  await sleep(1000);
}

console.log('End of sleep script. Time:', bot.time.timeOfDay, 'HP:', bot.health, 'Food:', bot.food);
