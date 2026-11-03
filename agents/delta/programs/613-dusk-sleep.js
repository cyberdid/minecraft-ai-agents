console.log('=== DUSK PROTOCOL: ENTER BASE & SLEEP WITH TEAM ===');

// Step through base door to Bed 2
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door passage:', e.message);
}

try {
  await bot.pathfinder.goto(new goals.GoalNear(293.0, 72.0, -56.0, 0.6));
} catch (e) {}

console.log('Inside base at Bed 2:', lib.fmt(bot.entity.position));
bot.chat('delta: Inside base beside Bed 2. Ready to sleep at tick 12542!');

const start = Date.now();
while (!isCancelled() && Date.now() - start < 45000) {
  const t = lib.time();
  if (t.canSleep) {
    const bed = bot.findBlock({ matching: b => b && b.name.endsWith('_bed'), maxDistance: 4 });
    if (bed) {
      console.log('Attempting sleep in bed at', lib.fmt(bed.position));
      try {
        await bot.sleep(bed);
        console.log('Delta is now sleeping!');
        bot.chat('delta: Sleeping in bed!');
        while (bot.isSleeping && !isCancelled()) {
          await sleep(400);
        }
        console.log('Woke up! Day arrived!');
        bot.chat('delta: Dawn! Stepping out to portal frame with flint_and_steel!');
        break;
      } catch (err) {
        console.log('Sleep error:', err.message);
      }
    }
  }
  await sleep(1000);
}

return {
  time: bot.time.timeOfDay,
  isSleeping: bot.isSleeping,
  hp: bot.health,
  food: bot.food
};
