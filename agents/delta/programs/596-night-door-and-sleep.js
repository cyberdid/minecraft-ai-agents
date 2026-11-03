console.log('=== NIGHT PROTOCOL: ENTER BASE & SLEEP ===');

// Step 1: Get inside base before night falls
if (bot.entity.position.z > -54.0) {
  console.log('Outside base, stepping through door...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    console.log('Door passage error:', e.message);
  }
}

// Move directly adjacent to Bed 2 at (293, 72, -56)
try {
  await bot.pathfinder.goto(new goals.GoalNear(293.0, 72.0, -56.0, 0.8));
} catch (e) {}

console.log('Inside base at:', lib.fmt(bot.entity.position));
bot.chat('delta: Inside base beside Bed 2. Standing by to sleep as soon as night arrives!');

// Step 2: Wait until canSleep is true, then sleep
const start = Date.now();
let slept = false;

while (!isCancelled() && Date.now() - start < 60000) {
  const t = lib.time();
  console.log(`[t=${Math.round((Date.now() - start)/1000)}s] night: ${t.night}, canSleep: ${t.canSleep}, secondsUntilNight: ${t.secondsUntilNight}`);

  if (t.canSleep) {
    const bed = bot.findBlock({ matching: b => b && b.name.endsWith('_bed'), maxDistance: 4 });
    if (bed) {
      console.log(`Found bed at ${lib.fmt(bed.position)}, sleeping...`);
      try {
        await bot.sleep(bed);
        console.log('Delta is now sleeping in bed!');
        slept = true;
        // Wait while sleeping until woken up by dawn
        while (bot.isSleeping && !isCancelled()) {
          await sleep(500);
        }
        console.log('Woke up! Day arrived!');
        bot.chat('delta: Good morning! Woke up from bed. Ready to ignite portal!');
        break;
      } catch (err) {
        console.log('bot.sleep error:', err.message);
      }
    }
  }

  await sleep(1500);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  slept
};
