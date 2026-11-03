// programs/538-night-sleep-coordination.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: NIGHT SLEEP COORDINATION ===');
console.log(`Current time: ${lib.time().time}, seconds until night: ${lib.time().secondsUntilNight}`);

bot.chat('delta: Inside base for night. Waiting for tick 12542 to sleep in bed with team!');

// Locate bed
const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
if (!bedBlock) {
  console.log('No bed within 6m, searching 12m...');
} else {
  console.log(`Bed found at ${lib.fmt(bedBlock.position)}`);
}

// Stand near bed at (294, 72, -55)
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -55, 0.8));
} catch (e) {}

// Wait until night falls (time >= 12542)
const start = Date.now();
while (!isCancelled() && Date.now() - start < 100000) {
  const t = bot.time.timeOfDay;
  if (t >= 12542 && t <= 23460) {
    console.log(`Night active (timeOfDay=${t})! Attempting to sleep...`);
    const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 5 });
    if (bed) {
      try {
        await bot.sleep(bed);
        console.log('Sleeping in bed...');
        bot.chat('delta: Sleeping in bed!');
        
        // Wait while sleeping until morning
        while (bot.isSleeping && !isCancelled()) {
          await sleep(500);
        }
        console.log('Woke up! Morning has arrived.');
        bot.chat('delta: Good morning team! Night skipped.');
        break;
      } catch (err) {
        console.log('Sleep attempt note:', err.message);
        await sleep(1500);
      }
    }
  } else {
    // If it's already day (night skipped by teammates)
    if (t < 12542 && t > 0 && Date.now() - start > 10000) {
      console.log(`Daytime active (timeOfDay=${t})!`);
      break;
    }
    await sleep(1000);
  }
}

console.log(`Finished. Pos: ${lib.fmt(bot.entity.position)}, Time: ${bot.time.timeOfDay}`);
return { time: bot.time.timeOfDay, pos: bot.entity.position, hp: bot.health, food: bot.food };
