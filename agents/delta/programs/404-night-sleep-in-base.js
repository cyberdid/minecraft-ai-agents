// programs/404-night-sleep-in-base.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'time:', bot.time.timeOfDay, 'HP:', bot.health, 'food:', bot.food);

// 1. Move inside base shelter
console.log('Entering base shelter at (293, 72, -56)...');
try {
  await lib.goTo(293, 72, -56, 1, { timeoutMs: 8000 });
} catch (e) {
  console.log('goTo base note:', e.message);
  await bot.lookAt(new Vec3(293.5, 72.0, -56.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

bot.chat('delta: Inside base shelter! Ready to sleep to dawn with team.');

// 2. Locate beds inside base
const bedIds = Object.keys(mcData.blocksByName).filter(k => k.endsWith('_bed')).map(k => mcData.blocksByName[k].id);
const beds = bot.findBlocks({
  matching: bedIds,
  maxDistance: 8,
  count: 5
});

console.log(`Found ${beds.length} beds inside base:`);
for (const bPos of beds) {
  const b = bot.blockAt(bPos);
  console.log(`  ${b.name} at ${lib.fmt(bPos)}`);
}

// 3. Await nightfall (tick 12542)
console.log('Current timeOfDay:', bot.time.timeOfDay);
while (!isCancelled() && (bot.time.timeOfDay < 12542 || bot.time.timeOfDay > 23460)) {
  const timeToNight = 12542 - bot.time.timeOfDay;
  if (timeToNight <= 0) break;
  if (timeToNight % 100 === 0) console.log(`Waiting for night: ${timeToNight} ticks (${(timeToNight/20).toFixed(1)}s)...`);
  await sleep(1000);
}

console.log('Night reached! Time:', bot.time.timeOfDay, 'attempting sleep in bed...');
for (const bPos of beds) {
  const bedBlock = bot.blockAt(bPos);
  if (!bedBlock) continue;
  try {
    await lib.sleep(bedBlock);
    console.log(`SUCCESS: Slept in bed at ${lib.fmt(bPos)}!`);
    break;
  } catch (e) {
    console.log(`Sleep in bed at ${lib.fmt(bPos)} note: ${e.message}`);
  }
}

console.log('Final state: pos:', lib.fmt(bot.entity.position), 'time:', bot.time.timeOfDay);
