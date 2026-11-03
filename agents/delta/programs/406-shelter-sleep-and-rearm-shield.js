// programs/406-shelter-sleep-and-rearm-shield.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'time:', bot.time.timeOfDay, 'HP:', bot.health, 'food:', bot.food);

// 1. Move inside base shelter at (293, 72, -56)
console.log('Entering base shelter at (293, 72, -56)...');
try {
  await lib.goTo(293, 72, -56, 1, { timeoutMs: 10000 });
} catch (e) {
  console.log('Move to base note:', e.message);
}

// 2. Locate beds inside base
const bedIds = Object.keys(mcData.blocksByName).filter(k => k.endsWith('_bed')).map(k => mcData.blocksByName[k].id);
const beds = bot.findBlocks({ matching: bedIds, maxDistance: 8, count: 4 });
console.log(`Found ${beds.length} beds inside base.`);

// 3. Await nightfall (tick 12542) to sleep
console.log('Waiting for night (12542) to skip night with team...');
while (!isCancelled() && (bot.time.timeOfDay < 12542 || bot.time.timeOfDay > 23460)) {
  const waitTicks = 12542 - bot.time.timeOfDay;
  if (waitTicks <= 0) break;
  if (waitTicks % 60 === 0) console.log(`Waiting for night: ${waitTicks} ticks (${(waitTicks/20).toFixed(1)}s)...`);
  await sleep(500);
}

console.log('Night reached! Time:', bot.time.timeOfDay, 'sleeping in bed...');
for (const bPos of beds) {
  const b = bot.blockAt(bPos);
  if (!b) continue;
  try {
    await lib.sleep(b);
    console.log(`Slept in bed at ${lib.fmt(bPos)}! Night skipped to dawn.`);
    break;
  } catch (e) {
    console.log(`Sleep note for bed at ${lib.fmt(bPos)}: ${e.message}`);
  }
}

console.log('Final state: pos:', lib.fmt(bot.entity.position), 'time:', bot.time.timeOfDay, 'HP:', bot.health);
