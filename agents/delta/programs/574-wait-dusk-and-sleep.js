// programs/574-wait-dusk-and-sleep.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: STANDBY AT BED FOR TICK 12542 SLEEP ===');
console.log(`Current timeOfDay: ${bot.time.timeOfDay}`);

const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
if (!bedBlock) {
  console.log('No bed within 6m!');
  return;
}

// Stand right next to bed
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -55, 0.8));
} catch (e) {}

console.log('Standing next to bed, waiting for tick 12542...');
bot.chat('delta: At bed! Awaiting tick 12542 to sleep with team!');

// Wait strictly until tick >= 12542
while (!isCancelled() && bot.time.timeOfDay < 12542) {
  await sleep(400);
}

console.log(`Dusk reached! timeOfDay=${bot.time.timeOfDay}. Calling bot.sleep...`);
try {
  await bot.sleep(bedBlock);
  console.log('Delta is sleeping in bed!');
  bot.chat('delta: In bed sleeping with team!');

  while (bot.isSleeping && !isCancelled()) {
    await sleep(400);
  }
  console.log(`Woke up! timeOfDay=${bot.time.timeOfDay}`);
  bot.chat('delta: Dawn! Night skipped!');
} catch (err) {
  console.log('Sleep notice:', err.message);
}

return {
  time: bot.time.timeOfDay,
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position
};
