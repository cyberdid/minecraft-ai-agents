// programs/512-inspect-beds-and-sleep.js
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('=== OVERWORLD BASE BEDS & NIGHT SLEEP ===');
console.log(`Current tick: ${bot.time.timeOfDay}, Night in: ${Math.max(0, Math.round((12542 - bot.time.timeOfDay) / 20))}s`);

// Scan for beds within 10m
const beds = bot.findBlocks({
  matching: b => b && b.name.endsWith('_bed'),
  maxDistance: 10,
  count: 5
});
console.log(`Found ${beds.length} beds:`, beds.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// If no bed found, check inventory for wool/planks to craft bed
if (beds.length === 0) {
  console.log('No placed beds found nearby! Checking wool and planks...');
  console.log('Inv wool:', lib.count('*_wool'), 'Planks:', lib.count('*_planks'));
}

// Wait until night (tick 12542)
if (bot.time.timeOfDay < 12542) {
  const waitMs = Math.min(90000, Math.round(((12542 - bot.time.timeOfDay) / 20) * 1000) + 1500);
  console.log(`Waiting ${Math.round(waitMs / 1000)}s until night (tick 12542)...`);
  const start = Date.now();
  while (bot.time.timeOfDay < 12542 && Date.now() - start < waitMs && !checkCancelled()) {
    await sleep(1000);
  }
}

console.log(`Current tick now: ${bot.time.timeOfDay}`);

// If night (12542-23460), sleep!
if (bot.time.timeOfDay >= 12542 && bot.time.timeOfDay <= 23460) {
  const targetBeds = bot.findBlocks({
    matching: b => b && b.name.endsWith('_bed'),
    maxDistance: 10,
    count: 5
  });

  if (targetBeds.length > 0) {
    const bedBlock = bot.blockAt(targetBeds[0]);
    console.log(`Attempting to sleep in bed at ${lib.fmt(bedBlock.position)}...`);
    try {
      await bot.sleep(bedBlock);
      console.log('Sleeping! Waiting for morning...');
      await sleep(5000);
      try { await bot.wake(); } catch (e) {}
      console.log('Morning! Tick:', bot.time.timeOfDay);
      bot.chat('delta: Good morning! Slept through night.');
    } catch (e) {
      console.log('Sleep error:', e.message);
    }
  } else {
    console.log('No bed available to sleep in.');
  }
}

return {
  timeOfDay: bot.time.timeOfDay,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
