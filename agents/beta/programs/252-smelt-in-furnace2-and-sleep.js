// programs/252-smelt-in-furnace2-and-sleep.js
console.log('=== Step 10: Smelt in Furnace 2 and manage night ===');

// 1. Check door
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// 2. Open Furnace 2 at (295, 72, -57)
const f2Block = bot.blockAt(new Vec3(295, 72, -57));
if (!f2Block) throw new Error('Furnace 2 not found');

const f2 = await bot.openFurnace(f2Block);
console.log('Opened Furnace 2. Input:', f2.inputItem()?.name, 'Fuel:', f2.fuelItem()?.name, 'Output:', f2.outputItem()?.name);

// Put fuel and input
if (f2.outputItem()) await f2.takeOutput();

if (lib.count('oak_planks') >= 6 && (!f2.fuelItem() || f2.fuelItem().name === 'oak_planks')) {
  console.log('Adding 6 oak_planks as fuel...');
  await f2.putFuel(mcData.itemsByName.oak_planks.id, null, 6);
}

if (lib.count('mutton') >= 8 && !f2.inputItem()) {
  console.log('Adding 8 mutton as input...');
  await f2.putInput(mcData.itemsByName.mutton.id, null, 8);
}

// Smelt for 40 seconds, periodically checking output and sleep status
const deadline = Date.now() + 45000;
let cookedCount = 0;

while (Date.now() < deadline && !isCancelled()) {
  await sleep(1500);
  if (f2.outputItem()) {
    cookedCount += f2.outputItem().count;
    await f2.takeOutput();
    console.log(`Took cooked mutton! Total so far: ${cookedCount}`);
  }
  if (lib.time().canSleep) {
    console.log('Sleep is now available!');
    break;
  }
}
f2.close();

// Try to sleep if night
if (lib.time().canSleep) {
  try {
    console.log('Attempting to sleep in bed...');
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (e) {
    console.log('sleepInBed note:', e.message);
  }
}

// Deposit cooked food into base chest
if (lib.count('cooked_mutton') > 0) {
  const depositCount = Math.min(4, lib.count('cooked_mutton'));
  await lib.deposit({ cooked_mutton: depositCount }, 293, 72, -57);
  console.log(`Deposited ${depositCount} cooked_mutton into base chest.`);
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time:', lib.time());
bot.chat(`beta: Smelted mutton. Placed cooked_mutton in base chest for us. Time: ${lib.time().phase}`);
