// programs/776-sleep-night-reset-food.js
console.log('=== Program 776: Enter Base & Sleep to Dawn ===');
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
console.log('Entering base shelter through door (294, 72, -54)...');
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
bot.chat('alpha: Inside base shelter! Moving to Bed 2 at (293, 72, -56) to sleep with Beta at tick 12542!');

// 3. Move to Bed 2 at (293, 72, -56)
const bed2Pos = new Vec3(293, 72, -56);
const bed1Pos = new Vec3(294, 72, -55);
let bed2Block = bot.blockAt(bed2Pos);
let bed1Block = bot.blockAt(bed1Pos);

console.log(`Bed 1 at (294, 72, -55): ${bed1Block?.name}`);
console.log(`Bed 2 at (293, 72, -56): ${bed2Block?.name}`);

// 4. Wait for tick 12542 (canSleep)
const startWait = Date.now();
while (!lib.time().canSleep && Date.now() - startWait < 45000 && !checkCancelled()) {
  await sleep(1000);
}

console.log('Tick 12542 reached! Sleeping in Bed 2...');
const bedToUse = (bed2Block && bot.isABed(bed2Block)) ? bed2Block : (bed1Block && bot.isABed(bed1Block) ? bed1Block : null);

if (bedToUse) {
  for (let attempt = 0; attempt < 12 && !checkCancelled(); attempt++) {
    try {
      console.log(`Sleep attempt ${attempt + 1}...`);
      await bot.sleep(bedToUse);
      console.log('Successfully asleep in bed! Waiting for night to pass...');
      break;
    } catch (e) {
      console.log('Sleep attempt note:', e.message);
      // Try alternate bed if occupied
      if (e.message.includes('occupied') && bed1Block && bot.isABed(bed1Block) && bedToUse !== bed1Block) {
        try { await bot.sleep(bed1Block); break; } catch (e2) {}
      }
      await sleep(1200);
    }
  }
}

// 5. Wait for dawn (night === false)
const waitDawn = Date.now();
while (lib.time().night && Date.now() - waitDawn < 25000 && !checkCancelled()) {
  await sleep(1000);
}

const statusNow = lib.status();
console.log('Dawn status:', JSON.stringify(statusNow));
if (!statusNow.night) {
  bot.chat(`alpha: Dawn reached! Night skipped. HP=${bot.health}, Food=${bot.food}/20. Ready to place lava & ignite portal!`);
}

return {
  time: bot.time.timeOfDay,
  night: lib.time().night,
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  inv: lib.inv()
};
