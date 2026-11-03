// programs/579-sleep-now.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== SLEEP NOW ===');
console.log('Current time:', bot.time.timeOfDay, 'night in:', Math.max(0, Math.ceil((12542 - bot.time.timeOfDay) / 20)), 's');

const bedPos = new Vec3(294, 72, -55);
const bed = bot.blockAt(bedPos);
console.log('Bed at (294, 72, -55):', bed ? bed.name : 'null');

bot.chat('gamma: Inside base standing by bed (294, 72, -55) to skip night with team!');

// Wait until canSleep
while (!bot.time.isNight && (bot.time.timeOfDay < 12542 || bot.time.timeOfDay > 23460) && !isCancelled()) {
  await sleep(1000);
}

if (!isCancelled()) {
  console.log('Night has arrived! Sleeping in bed...');
  try {
    await bot.sleep(bed);
    console.log('Successfully sleeping in bed!');
    bot.chat('gamma: Sleeping in bed to skip night!');
  } catch (e) {
    console.log('Sleep error/note:', e.message);
  }

  // Sleep until morning
  while (bot.isSleeping && !isCancelled()) {
    await sleep(500);
  }
  console.log('Morning! New time:', bot.time.timeOfDay);
  bot.chat(`gamma: Morning! Night skipped. Time: ${bot.time.timeOfDay}.`);
}

return {
  time: bot.time.timeOfDay,
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position
};
