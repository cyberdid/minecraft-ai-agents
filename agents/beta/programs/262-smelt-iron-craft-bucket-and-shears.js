// programs/262-smelt-iron-craft-bucket-and-shears.js
console.log('=== Step 20: Smelt remaining iron, craft bucket & shears, fill water bucket ===');

const f1Block = bot.blockAt(new Vec3(295, 72, -55));
const f2Block = bot.blockAt(new Vec3(295, 72, -57));

// 1. Take any outputs from F1 and F2
if (f1Block) {
  const f1 = await bot.openFurnace(f1Block);
  if (f1.outputItem()) {
    console.log(`Taking ${f1.outputItem().count} ${f1.outputItem().name} from F1.`);
    await f1.takeOutput();
  }
  // If we have raw_iron, put it in F1 with fuel
  if (lib.count('raw_iron') > 0) {
    if (!f1.fuelItem() && lib.count('oak_planks') > 0) {
      await f1.putFuel(mcData.itemsByName.oak_planks.id, null, Math.min(4, lib.count('oak_planks')));
    } else if (!f1.fuelItem() && lib.count('birch_log') > 0) {
      // Craft planks first if needed
      await lib.craft('birch_planks', 4);
      await f1.putFuel(mcData.itemsByName.birch_planks.id, null, 4);
    }
    const toSmelt = lib.count('raw_iron');
    console.log(`Putting ${toSmelt} raw_iron into F1...`);
    await f1.putInput(mcData.itemsByName.raw_iron.id, null, toSmelt);
  }
  f1.close();
}

// Check F2 output as well
if (f2Block) {
  const f2 = await bot.openFurnace(f2Block);
  if (f2.outputItem()) {
    console.log(`Taking ${f2.outputItem().count} ${f2.outputItem().name} from F2.`);
    await f2.takeOutput();
  }
  f2.close();
}

// 2. Smelt until we have at least 5 iron ingots (or all raw_iron smelted)
console.log('Smelting iron ingots...');
const deadline = Date.now() + 45000;
while (lib.count('iron_ingot') < 5 && lib.count('raw_iron') > 0 && Date.now() < deadline && !isCancelled()) {
  await sleep(3000);
  if (f1Block) {
    const f1 = await bot.openFurnace(f1Block);
    if (f1.outputItem()) {
      console.log(`Took ${f1.outputItem().count} ${f1.outputItem().name} from F1`);
      await f1.takeOutput();
    }
    f1.close();
  }
}

console.log(`Iron ingots available: ${lib.count('iron_ingot')}`);

// 3. Craft Bucket (3 ingots)
if (lib.count('bucket') === 0 && lib.count('water_bucket') === 0 && lib.count('iron_ingot') >= 3) {
  console.log('Crafting bucket...');
  try {
    await lib.craft('bucket', 1);
    console.log('Bucket crafted!');
  } catch (e) {
    console.log('Bucket craft error:', e.message);
  }
}

// 4. Craft Shears (2 ingots)
if (lib.count('shears') === 0 && lib.count('iron_ingot') >= 2) {
  console.log('Crafting shears...');
  try {
    await lib.craft('shears', 1);
    console.log('Shears crafted!');
  } catch (e) {
    console.log('Shears craft error:', e.message);
  }
}

// 5. Fill Bucket with water if we have empty bucket
if (lib.count('bucket') > 0) {
  console.log('Exiting base to fill water bucket...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    await lib.goTo(294, 72, -52, 1);
  }

  try {
    console.log('Filling bucket with water...');
    await lib.fillBucket('water');
    console.log('Water bucket filled! MILESTONE 5 COMPLETE FOR BETA!');
    bot.chat('alpha: Beta filled water bucket! Milestone 5 achieved!');
  } catch (e) {
    console.log('fillBucket note:', e.message);
  }

  // Return to base door
  await lib.goTo(294, 72, -53, 1);
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Progress update. Water bucket: ${lib.count('water_bucket')}, shears: ${lib.count('shears')}, iron ingots: ${lib.count('iron_ingot')}.`);
