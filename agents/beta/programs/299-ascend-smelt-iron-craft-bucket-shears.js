// programs/299-ascend-smelt-iron-craft-bucket-shears.js
console.log('=== Step 55: Ascend to base, smelt iron, craft bucket, shears, flint & steel ===');

// 1. Ascend to surface base
console.log('Ascending to surface...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 25000, dig: true });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base safely!');
} catch (e) {
  console.log('Ascent note:', e.message);
  await lib.goTo(294, 72, -55, 1, { timeoutMs: 15000, dig: true });
}

// 2. Load Furnace 1
const f1Block = bot.blockAt(new Vec3(295, 72, -55));
if (f1Block && lib.count('raw_iron') > 0) {
  const f1 = await bot.openFurnace(f1Block);
  if (!f1.fuelItem() && lib.count('birch_planks') >= 4) {
    await f1.putFuel(mcData.itemsByName.birch_planks.id, null, 4);
  }
  if (!f1.inputItem()) {
    await f1.putInput(mcData.itemsByName.raw_iron.id, null, lib.count('raw_iron'));
    console.log(`Loaded ${lib.count('raw_iron')} raw_iron into F1.`);
  }
  f1.close();
}

// 3. Extract flint from gravel
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
console.log(`Flint extraction: ${lib.count('flint')} flint.`);

// 4. Wait for smelting and take iron ingots
console.log('Waiting for iron smelting...');
const deadline = Date.now() + 35000;
while (Date.now() < deadline && !isCancelled() && lib.count('iron_ingot') < 5) {
  await sleep(3000);
  if (f1Block) {
    const f1 = await bot.openFurnace(f1Block);
    if (f1.outputItem()) {
      console.log(`Taking ${f1.outputItem().count} iron_ingot from F1.`);
      await f1.takeOutput();
    }
    f1.close();
  }
}

console.log(`Iron ingots available: ${lib.count('iron_ingot')}`);

// 5. Craft bucket
if (lib.count('bucket') === 0 && lib.count('water_bucket') === 0 && lib.count('iron_ingot') >= 3) {
  console.log('Crafting bucket...');
  try {
    await lib.craft('bucket', 1);
    console.log('Bucket crafted!');
  } catch (e) {
    console.log('Bucket craft note:', e.message);
  }
}

// 6. Fill bucket with water outside
if (lib.count('bucket') > 0) {
  console.log('Exiting to fill water bucket...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    await lib.fillBucket('water');
    console.log('Water bucket filled!');
    await lib.goTo(294, 72, -53, 1);
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    console.log('Fill water note:', e.message);
  }
}

// 7. Craft flint and steel
if (lib.count('flint_and_steel') === 0 && lib.count('flint') > 0 && lib.count('iron_ingot') > 0) {
  console.log('Crafting flint_and_steel...');
  try {
    await lib.craft('flint_and_steel', 1);
    console.log('Flint and steel crafted!');
  } catch (e) {
    console.log('Flint and steel craft note:', e.message);
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Rebuilding progress: water_bucket: ${lib.count('water_bucket')}, flint_and_steel: ${lib.count('flint_and_steel')}, iron_ingot: ${lib.count('iron_ingot')}.`);
