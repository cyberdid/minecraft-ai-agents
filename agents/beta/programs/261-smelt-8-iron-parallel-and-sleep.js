// programs/261-smelt-8-iron-parallel-and-sleep.js
console.log('=== Step 19: Parallel Smelt 8 Raw Iron and Sleep Night ===');

// Make sure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

const f1Block = bot.blockAt(new Vec3(295, 72, -55));
const f2Block = bot.blockAt(new Vec3(295, 72, -57));

// 1. Setup Furnace 1: 4 raw_iron, 4 oak_planks
if (f1Block) {
  const f1 = await bot.openFurnace(f1Block);
  if (f1.outputItem()) await f1.takeOutput();
  console.log('F1 state:', { input: f1.inputItem()?.name, fuel: f1.fuelItem()?.name });
  if (!f1.fuelItem() && lib.count('oak_planks') >= 4) {
    await f1.putFuel(mcData.itemsByName.oak_planks.id, null, 4);
  }
  if (!f1.inputItem() && lib.count('raw_iron') >= 4) {
    await f1.putInput(mcData.itemsByName.raw_iron.id, null, 4);
    console.log('F1 loaded with 4 raw_iron.');
  }
  f1.close();
}

// 2. Setup Furnace 2: 4 raw_iron, 4 oak_planks
if (f2Block) {
  const f2 = await bot.openFurnace(f2Block);
  if (f2.outputItem()) await f2.takeOutput();
  console.log('F2 state:', { input: f2.inputItem()?.name, fuel: f2.fuelItem()?.name });
  if (!f2.fuelItem() && lib.count('oak_planks') >= 4) {
    await f2.putFuel(mcData.itemsByName.oak_planks.id, null, 4);
  }
  if (!f2.inputItem() && lib.count('raw_iron') >= 4) {
    await f2.putInput(mcData.itemsByName.raw_iron.id, null, 4);
    console.log('F2 loaded with 4 raw_iron.');
  }
  f2.close();
}

// 3. Monitor smelting and sleep when night falls
console.log('Waiting for smelting and sleep tick (12542)...');
const deadline = Date.now() + 60000;
let slept = false;

while (Date.now() < deadline && !isCancelled()) {
  const t = lib.time();
  if (t.canSleep && !slept) {
    console.log(`Sleep tick reached (${t.timeOfDay}). Sleeping...`);
    try {
      await lib.sleepInBed();
      console.log('Slept in bed!');
      slept = true;
    } catch (e) {
      console.log('sleepInBed note:', e.message);
    }
  }
  await sleep(2000);
  // Break if morning has come and time is daytime
  if (slept && lib.time().phase === 'day') {
    console.log('Morning arrived!');
    break;
  }
}

// 4. Collect iron outputs from both furnaces
if (f1Block) {
  const f1 = await bot.openFurnace(f1Block);
  if (f1.outputItem()) {
    console.log(`F1 Output: ${f1.outputItem().count} ${f1.outputItem().name}`);
    await f1.takeOutput();
  }
  f1.close();
}

if (f2Block) {
  const f2 = await bot.openFurnace(f2Block);
  if (f2.outputItem()) {
    console.log(`F2 Output: ${f2.outputItem().count} ${f2.outputItem().name}`);
    await f2.takeOutput();
  }
  f2.close();
}

// 5. Craft Iron Gear
console.log(`Iron ingots on beta: ${lib.count('iron_ingot')}`);

// Craft iron pickaxe
if (lib.count('iron_pickaxe') === 0 && lib.count('iron_ingot') >= 3) {
  // Make sure we have 2 sticks
  if (lib.count('stick') < 2) {
    await lib.craft('oak_planks', 4);
    await lib.craft('stick', 4);
  }
  console.log('Crafting iron_pickaxe...');
  try {
    await lib.craft('iron_pickaxe', 1);
    console.log('Iron pickaxe crafted successfully! MILESTONE 2 COMPLETE FOR BETA!');
  } catch (e) {
    console.log('Iron pickaxe craft error:', e.message);
  }
}

// Craft bucket
if (lib.count('bucket') === 0 && lib.count('iron_ingot') >= 3) {
  console.log('Crafting bucket...');
  try {
    await lib.craft('bucket', 1);
    console.log('Bucket crafted successfully!');
  } catch (e) {
    console.log('Bucket craft error:', e.message);
  }
}

// Craft shears
if (lib.count('shears') === 0 && lib.count('iron_ingot') >= 2) {
  console.log('Crafting shears...');
  try {
    await lib.craft('shears', 1);
    console.log('Shears crafted successfully!');
  } catch (e) {
    console.log('Shears craft error:', e.message);
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));
console.log('Time:', lib.time());

bot.chat(`beta: Morning! Gear update: iron_pickaxe: ${lib.count('iron_pickaxe')}, bucket: ${lib.count('bucket')}, shears: ${lib.count('shears')}, iron_ingot: ${lib.count('iron_ingot')}.`);
