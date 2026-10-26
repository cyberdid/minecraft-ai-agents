// programs/016-night-sleep.js
console.log('gamma pos:', lib.fmt(bot.entity.position));
console.log('Current time:', bot.time.timeOfDay, 'canSleep:', lib.time().canSleep);

// Wait until canSleep
while (!lib.time().canSleep && bot.time.timeOfDay < 12542 && !isCancelled()) {
  await sleep(1000);
}

console.log('Sleep time reached at tick', bot.time.timeOfDay);

// Try to sleep in bed
const beds = bot.findBlocks({ matching: (bl) => bot.isABed(bl), maxDistance: 16 });
console.log(`Found ${beds.length} beds:`, beds.map(p => lib.fmt(p)));

for (const bedPos of beds) {
  const bedBlock = bot.blockAt(bedPos);
  console.log(`Attempting bed at ${lib.fmt(bedPos)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(bedPos.x, bedPos.y, bedPos.z, 1));
    await bot.sleep(bedBlock);
    console.log(`Sleeping in bed at ${lib.fmt(bedPos)}!`);
    bot.chat('gamma is sleeping in bed!');
    break;
  } catch (err) {
    console.log(`Cannot sleep in bed at ${lib.fmt(bedPos)}: ${err.message}`);
  }
}

// Wait safely until morning (time passes 23460 or resets to 0..1000)
while (!isCancelled()) {
  const t = bot.time.timeOfDay;
  if (t >= 23460 || t < 1000) {
    console.log(`Morning arrived! Tick: ${t}`);
    bot.chat('Morning! gamma waking up.');
    break;
  }
  await sleep(3000);
}

// If still sleeping, wake up
if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

console.log('Status at dawn:');
console.log('Time:', bot.time.timeOfDay, lib.time().phase);
console.log('Inventory:', JSON.stringify(lib.inv()));
