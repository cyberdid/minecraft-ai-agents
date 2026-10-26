// programs/028-sleep-watch.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// Check players
for (const p of Object.values(bot.players)) {
  if (p.username !== 'gamma' && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

// Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// Wait for sleep time (12542)
console.log('Waiting for sleep time (12542)... current:', bot.time.timeOfDay);
while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  await sleep(1000);
}

console.log('Sleep time reached at tick', bot.time.timeOfDay);

// Find beds in base
const beds = bot.findBlocks({ matching: (bl) => bot.isABed(bl), maxDistance: 16 });
console.log(`Found ${beds.length} beds:`, beds.map(p => lib.fmt(p)));

for (const bedPos of beds) {
  const bedBlock = bot.blockAt(bedPos);
  console.log(`Trying bed at ${lib.fmt(bedPos)}...`);
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

// Wait safely until dawn
while (!isCancelled()) {
  const t = bot.time.timeOfDay;
  if (t >= 23460 || t < 1000) {
    console.log(`Morning arrived! Tick: ${t}`);
    bot.chat('Morning! gamma waking up.');
    break;
  }
  await sleep(3000);
}

if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

// Take smelted iron from furnace
const fBlock = bot.blockAt(new Vec3(295, 72, -55));
if (fBlock) {
  try {
    const f = await bot.openFurnace(fBlock);
    if (f.outputItem()) {
      console.log('Took smelted output:', f.outputItem().name, 'x' + f.outputItem().count);
      await f.takeOutput();
    }
    f.close();
  } catch (e) {}
}

console.log('Dawn inventory:', JSON.stringify(lib.inv()));
console.log('Dawn time:', bot.time.timeOfDay, lib.time().phase);
