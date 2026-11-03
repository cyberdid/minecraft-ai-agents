// programs/573-night-shelter-and-sleep.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: NIGHT PROTOCOL - ENTER BASE & SLEEP ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, Time: ${bot.time.timeOfDay}`);

// Step 1: Walk to door and enter base
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 0.8));
} catch (e) {}

console.log('Passing through base door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door notice:', e.message);
}

console.log(`Inside base room at: ${lib.fmt(bot.entity.position)}`);
bot.chat('delta: Inside base shelter! Waiting with Gamma to sleep in bed as soon as dusk hits tick 12542!');

// Step 2: Locate bed at (294, 72, -55)
const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
console.log('Bed block:', bedBlock ? lib.fmt(bedBlock.position) : 'none');

// Step 3: Wait for tick >= 12542 and sleep
const start = Date.now();
while (!isCancelled() && Date.now() - start < 45000) {
  const t = bot.time.timeOfDay;
  if (t >= 12542 && t <= 23460) {
    console.log(`Night active! (timeOfDay=${t}). Attempting sleep...`);
    if (bedBlock) {
      try {
        await bot.sleep(bedBlock);
        console.log('Delta is sleeping in bed!');
        bot.chat('delta: In bed sleeping with team!');
        while (bot.isSleeping && !isCancelled()) {
          await sleep(500);
        }
        console.log(`Woke up! timeOfDay=${bot.time.timeOfDay}`);
        bot.chat('delta: Good morning! Night skipped to dawn!');
        break;
      } catch (err) {
        console.log('Sleep notice:', err.message);
        await sleep(1000);
      }
    }
  } else {
    // If night already passed (morning)
    if (t < 12000 && Date.now() - start > 10000) {
      console.log(`Daytime restored! (timeOfDay=${t})`);
      break;
    }
    await sleep(600);
  }
}

console.log('=== MORNING STATUS ===');
console.log(`TimeOfDay: ${bot.time.timeOfDay}, Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

return {
  time: bot.time.timeOfDay,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
