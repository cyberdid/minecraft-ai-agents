// programs/556-sleep-to-dawn.js
console.log('=== DELTA: SLEEP WITH ALPHA TO SKIP NIGHT ===');
console.log(`Current timeOfDay: ${bot.time.timeOfDay}`);

// Find bed
const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
if (bedBlock) {
  console.log(`Bed found at ${lib.fmt(bedBlock.position)}!`);
  // Wait until tick >= 12542
  while (bot.time.timeOfDay < 12542 && bot.time.timeOfDay > 12000) {
    await sleep(200);
  }
  
  try {
    console.log(`Sleeping in bed at timeOfDay=${bot.time.timeOfDay}...`);
    await bot.sleep(bedBlock);
    bot.chat('delta: In bed sleeping with Alpha!');
    
    // Wait until morning
    while (bot.isSleeping) {
      await sleep(300);
    }
    console.log(`Woke up! timeOfDay=${bot.time.timeOfDay}`);
    bot.chat('delta: Good morning! Dawn has broken, night skipped!');
  } catch (err) {
    console.log('Sleep error:', err.message);
  }
}

console.log(`Final time: ${bot.time.timeOfDay}, pos: ${lib.fmt(bot.entity.position)}`);
return { time: bot.time.timeOfDay, hp: bot.health, food: bot.food };
