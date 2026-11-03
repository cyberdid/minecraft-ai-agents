// programs/786-night-protocol-and-audit.js
console.log('=== Program 786: Enter Base Shelter & Sleep Night Protocol ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'food:', bot.food, 'HP:', bot.health, 'time:', bot.time.timeOfDay);

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
console.log('Entering base shelter...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(293, 72, -55, 1.0, { timeoutMs: 4000 });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));
bot.chat('alpha: Inside base shelter! Night protocol active. Waiting with team to sleep at tick 12542!');

// 3. Check players in base
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} holding: ${p.entity.heldItem?.name}`);
  }
}

// 4. Check beds
const bed1 = bot.blockAt(new Vec3(294, 72, -55));
const bed2 = bot.blockAt(new Vec3(293, 72, -56));
console.log(`Bed 1 at (294, 72, -55): ${bed1?.name}`);
console.log(`Bed 2 at (293, 72, -56): ${bed2?.name}`);

// 5. Wait for tick 12542 (canSleep)
const startWait = Date.now();
while (!lib.time().canSleep && Date.now() - startWait < 50000 && !checkCancelled()) {
  await sleep(1000);
}

// 6. Sleep in available bed
if (bed1 && bot.isABed(bed1)) {
  for (let attempt = 0; attempt < 12 && !checkCancelled(); attempt++) {
    try {
      console.log(`Attempting to sleep in Bed 1 (attempt ${attempt + 1})...`);
      await bot.sleep(bed1);
      console.log('Successfully sleeping in Bed 1!');
      break;
    } catch (e) {
      console.log('Bed 1 sleep note:', e.message);
      await sleep(1200);
    }
  }
}

// 7. Wait for dawn
const waitDawn = Date.now();
while (lib.time().night && Date.now() - waitDawn < 25000 && !checkCancelled()) {
  await sleep(1000);
}

const statusNow = lib.status();
console.log('Post-night status:', JSON.stringify(statusNow));
if (!statusNow.night) {
  bot.chat(`alpha: Dawn! Night skipped. HP=${bot.health}, Food=${bot.food}/20. Portal repair resuming!`);
}

return {
  time: bot.time.timeOfDay,
  night: lib.time().night,
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  inv: lib.inv()
};
