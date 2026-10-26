// programs/256-smelt-iron-and-food-craft-shield-bucket.js
console.log('=== Step 14: Check chest, smelt iron and food, craft shield & bucket ===');

// Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// 1. Inspect chest for raw iron or wool from Alpha
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Base chest contents:', JSON.stringify(chest));

let totalRawIron = lib.count('raw_iron');
if (chest.raw_iron) {
  console.log(`Withdrawing ${chest.raw_iron} raw_iron from chest...`);
  await lib.withdraw({ raw_iron: chest.raw_iron }, chestPos.x, chestPos.y, chestPos.z);
  totalRawIron = lib.count('raw_iron');
}
console.log(`Beta now holds ${totalRawIron} raw_iron.`);

// 2. Load Furnace 1 with raw_iron and 1 coal
const f1Block = bot.blockAt(new Vec3(295, 72, -55));
if (f1Block) {
  const f1 = await bot.openFurnace(f1Block);
  if (f1.outputItem()) await f1.takeOutput();
  console.log('F1 state:', { input: f1.inputItem()?.name, fuel: f1.fuelItem()?.name, output: f1.outputItem()?.name });

  // Add coal if needed
  if (!f1.fuelItem() && lib.count('coal') > 0) {
    await f1.putFuel(mcData.itemsByName.coal.id, null, 1);
  }
  // Add raw_iron
  if (lib.count('raw_iron') > 0 && !f1.inputItem()) {
    const amount = lib.count('raw_iron');
    console.log(`Putting ${amount} raw_iron into Furnace 1...`);
    await f1.putInput(mcData.itemsByName.raw_iron.id, null, amount);
  }
  f1.close();
}

// 3. Load Furnace 2 with porkchop and coal
const f2Block = bot.blockAt(new Vec3(295, 72, -57));
if (f2Block) {
  const f2 = await bot.openFurnace(f2Block);
  if (f2.outputItem()) await f2.takeOutput();
  console.log('F2 state:', { input: f2.inputItem()?.name, fuel: f2.fuelItem()?.name, output: f2.outputItem()?.name });

  if (!f2.fuelItem() && lib.count('coal') > 0) {
    await f2.putFuel(mcData.itemsByName.coal.id, null, 2);
  }
  if (lib.count('porkchop') > 0 && !f2.inputItem()) {
    const amount = lib.count('porkchop');
    console.log(`Putting ${amount} porkchop into Furnace 2...`);
    await f2.putInput(mcData.itemsByName.porkchop.id, null, amount);
  }
  f2.close();
}

// 4. Wait for smelting iron in Furnace 1 (takes ~20-40s)
console.log('Waiting for iron smelting...');
const deadline = Date.now() + 35000;
while (Date.now() < deadline && !isCancelled()) {
  await sleep(2000);
  const f1 = await bot.openFurnace(f1Block);
  if (f1.outputItem()) {
    console.log(`Taking ${f1.outputItem().count} ${f1.outputItem().name} from F1`);
    await f1.takeOutput();
  }
  f1.close();

  // If we have enough iron, stop waiting early
  if (lib.count('iron_ingot') >= 4 || (totalRawIron > 0 && lib.count('iron_ingot') >= totalRawIron)) {
    break;
  }
}

// Check F2 for cooked porkchops
if (f2Block) {
  const f2 = await bot.openFurnace(f2Block);
  if (f2.outputItem()) {
    console.log(`Taking ${f2.outputItem().count} ${f2.outputItem().name} from F2`);
    await f2.takeOutput();
  }
  f2.close();
}

// 5. Craft Shield & Bucket
console.log(`Iron ingots available: ${lib.count('iron_ingot')}`);

if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('oak_planks') >= 6) {
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
    await lib.equipArmor();
    console.log('Shield crafted and equipped in off-hand!');
  } catch (e) {
    console.log('Shield craft error:', e.message);
  }
}

if (lib.count('bucket') === 0 && lib.count('iron_ingot') >= 3) {
  console.log('Crafting bucket...');
  try {
    await lib.craft('bucket', 1);
    console.log('Bucket crafted!');
  } catch (e) {
    console.log('Bucket craft error:', e.message);
  }
}

// 6. Check time and sleep if night
const t = lib.time();
console.log('Time status:', t);
if (t.canSleep) {
  try {
    console.log('Sleeping in bed...');
    await lib.sleepInBed();
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: Smelting progress. Iron ingots: ${lib.count('iron_ingot')}, shield: ${lib.count('shield')}, bucket: ${lib.count('bucket')}.`);
