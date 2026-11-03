// programs/627-sleep-dusk.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== SLEEP DUSK ===');
console.log('Time:', bot.time.timeOfDay);

bot.chat('gamma: Standing beside Bed 1 at (294, 72, -55) to sleep with Delta and team at tick 12542!');

while (!bot.time.isNight && (bot.time.timeOfDay < 12542 || bot.time.timeOfDay > 23460) && !isCancelled()) {
  await sleep(1000);
}

if (!isCancelled()) {
  console.log('Tick 12542 reached! Sleeping...');
  const bed = bot.blockAt(new Vec3(294, 72, -55));
  if (bed) {
    try {
      await bot.sleep(bed);
      console.log('Sleeping peacefully in bed!');
      bot.chat('gamma: In bed skipping night with team!');
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }

  while (bot.isSleeping && !isCancelled()) {
    await sleep(500);
  }
  console.log('Morning reached! New time:', bot.time.timeOfDay);
  bot.chat(`gamma: Morning! Night skipped. Time: ${bot.time.timeOfDay}.`);
}

return {
  time: bot.time.timeOfDay,
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position
};
