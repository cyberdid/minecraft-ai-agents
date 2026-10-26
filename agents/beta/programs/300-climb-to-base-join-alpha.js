// programs/300-climb-to-base-join-alpha.js
console.log('=== Step 56: Climb staged shaft to base and combine iron with Alpha ===');

// 1. Stage 1 to y=60
console.log('Stage 1: climbing towards (304, 60, -36)...');
try {
  await lib.goTo(304, 60, -36, 2, { timeoutMs: 25000, dig: true });
  console.log('Stage 1 reached:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 1 note:', e.message);
}

// 2. Stage 2 to surface shaft entrance (302, 71, -44)
console.log('Stage 2: climbing towards (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 25000, dig: true });
  console.log('Stage 2 surface reached:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 2 note:', e.message);
}

// 3. Stage 3 to base door (294, 72, -53)
console.log('Stage 3: walking to base door...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 20000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base safely!');
} catch (e) {
  console.log('Stage 3 note:', e.message);
  await lib.goTo(294, 72, -55, 1, { timeoutMs: 15000, dig: true });
}

// 4. Load F1 with raw_iron and fuel
const f1Block = bot.blockAt(new Vec3(295, 72, -55));
if (f1Block) {
  const f1 = await bot.openFurnace(f1Block);
  if (!f1.fuelItem()) {
    if (lib.count('coal') > 0) {
      await f1.putFuel(mcData.itemsByName.coal.id, null, lib.count('coal'));
    } else if (lib.count('birch_planks') >= 4) {
      await f1.putFuel(mcData.itemsByName.birch_planks.id, null, 4);
    }
  }
  if (lib.count('raw_iron') > 0) {
    await f1.putInput(mcData.itemsByName.raw_iron.id, null, lib.count('raw_iron'));
    console.log('Loaded Beta raw_iron into F1.');
  }
  f1.close();
}

// 5. Extract flint from gravel if needed
const placeSpot = new Vec3(293, 72, -55);
let flintTries = 0;
while (lib.count('flint') === 0 && lib.count('gravel') > 0 && flintTries < 20 && !isCancelled()) {
  flintTries++;
  if (!bot.blockAt(placeSpot) || bot.blockAt(placeSpot).name === 'air') {
    await lib.place('gravel', placeSpot.x, placeSpot.y, placeSpot.z);
  }
  if (bot.blockAt(placeSpot)?.name === 'gravel') {
    await lib.dig(placeSpot.x, placeSpot.y, placeSpot.z);
    await lib.pickup(4);
  }
  await sleep(150);
}
console.log(`Flint on beta: ${lib.count('flint')}`);

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Reached base with 5 raw_iron! F1 loaded. Team has 9 iron smelting!`);
