console.log('=== SLEEP IN BED NOW ===');
console.log('Time info:', lib.time());

const beds = bot.findBlocks({ matching: b => b && b.name.endsWith('_bed'), maxDistance: 5, count: 5 });
console.log(`Found ${beds.length} bed blocks nearby:`, beds.map(p => lib.fmt(p)));

const bed = bot.findBlock({ matching: b => b && b.name.endsWith('_bed'), maxDistance: 4 });
if (!bed) {
  throw new Error('No bed found within 4 blocks');
}

console.log(`Sleeping in bed at ${lib.fmt(bed.position)}...`);
try {
  await bot.sleep(bed);
  console.log('Delta is successfully in bed!');
  bot.chat('delta: Sleeping in bed!');
  
  // Wait until woken up by dawn
  const start = Date.now();
  while (bot.isSleeping && Date.now() - start < 35000 && !isCancelled()) {
    await sleep(500);
  }
  console.log(`Woke up! Dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}, time: ${bot.time.timeOfDay}`);
  bot.chat('delta: Morning arrived! Stepping out to portal frame.');
} catch (err) {
  console.log('Sleep error:', err.message);
  // If occupied or already night, retry every second
  for (let i = 0; i < 15; i++) {
    if (isCancelled()) break;
    await sleep(1000);
    try {
      await bot.sleep(bed);
      console.log('Retry sleep success!');
      while (bot.isSleeping && !isCancelled()) {
        await sleep(500);
      }
      break;
    } catch (e2) {
      console.log(`Retry ${i}:`, e2.message);
    }
  }
}

return {
  isSleeping: bot.isSleeping,
  time: bot.time.timeOfDay,
  hp: bot.health,
  food: bot.food
};
