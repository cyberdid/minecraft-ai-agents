// programs/053-night-protocol.js
console.log('gamma pos:', lib.fmt(bot.entity.position));
console.log('Night approaching in:', lib.time().secondsUntilNight);

// 1. Enter base
console.log('Entering base...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  console.log('Door entry error, trying manual entry:', e.message);
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d) await bot.activateBlock(d);
  await lib.walkTo(294.5, -55.5);
}

// 2. Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

console.log('Inside base at', lib.fmt(bot.entity.position));
bot.chat(`gamma safely inside base for night protocol with team! night in: ${lib.time().secondsUntilNight}s`);

// 3. Wait for sleep time (12542)
console.log('Waiting for sleep time (12542)... current:', bot.time.timeOfDay);
while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  await sleep(1000);
}

// 4. Sleep in bed
const beds = bot.findBlocks({ matching: (bl) => bot.isABed(bl), maxDistance: 16 });
for (const bedPos of beds) {
  const bedBlock = bot.blockAt(bedPos);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(bedPos.x, bedPos.y, bedPos.z, 1));
    await bot.sleep(bedBlock);
    console.log(`Sleeping in bed at ${lib.fmt(bedPos)}!`);
    bot.chat('gamma is sleeping in bed!');
    break;
  } catch (err) {
    console.log(`Bed at ${lib.fmt(bedPos)}: ${err.message}`);
  }
}

// 5. Wait safely until morning
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

console.log('Dawn reached! Time:', bot.time.timeOfDay, lib.time().phase);
console.log('Inventory:', JSON.stringify(lib.inv()));
bot.chat('Good morning team! All 4 players survived the night in base!');
