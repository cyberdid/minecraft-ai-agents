// programs/763-enter-base-and-sleep.js
console.log('=== Program 763: Enter Base & Sleep Through Night ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

// 2. Enter base through door at (294, 72, -54)
console.log('Entering base through door at (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (err) {
  console.log('goThroughDoor note:', err.message);
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(294, 72, -55, 1.0, { timeoutMs: 5000 });
    await lib.door(294, 72, -54, false);
  } catch (e) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));
bot.chat('alpha: Inside base shelter! Waiting with team to sleep at tick 12542 to reset hunger and advance to dawn!');

// 3. Find bed
const beds = bot.findBlocks({
  matching: b => b && b.name.includes('bed'),
  maxDistance: 8,
  count: 4
});
console.log(`Beds found in base (${beds.length}):`, beds.map(p => lib.fmt(p)));

// 4. Wait for night / canSleep
const startWait = Date.now();
while (!lib.time().canSleep && Date.now() - startWait < 80000 && !checkCancelled()) {
  const t = lib.time();
  if (t.secondsUntilNight <= 5) break;
  await sleep(1000);
}

// 5. Sleep in bed
console.log('Dusk/Night reached! Attempting to sleep in bed...');
const targetBed = beds.length > 0 ? bot.blockAt(beds[0]) : null;

if (targetBed) {
  for (let attempt = 0; attempt < 10 && !checkCancelled(); attempt++) {
    try {
      console.log(`Sleep attempt ${attempt + 1}...`);
      await bot.sleep(targetBed);
      console.log('Sleeping in bed! Waiting for dawn...');
      break;
    } catch (e) {
      console.log('Sleep note:', e.message);
      // Try second bed if available
      if (beds.length > 1) {
        try {
          await bot.sleep(bot.blockAt(beds[1]));
          break;
        } catch (e2) {}
      }
      await sleep(1500);
    }
  }
}

// Wait until morning (time < 1000 or night is false)
const waitMorning = Date.now();
while (lib.time().night && Date.now() - waitMorning < 25000 && !checkCancelled()) {
  await sleep(1000);
}

const statusNow = lib.status();
console.log('Status after night:', JSON.stringify(statusNow));
if (!statusNow.night) {
  bot.chat(`alpha: Dawn! Night skipped. HP=${bot.health}, Food=${bot.food}/20. Ready to complete portal repair!`);
}

return {
  time: bot.time.timeOfDay,
  night: lib.time().night,
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  inv: lib.inv()
};
