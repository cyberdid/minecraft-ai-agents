// programs/267-smelt-iron-eat-check-flint-and-sleep.js
console.log('=== Step 25: Eat, fuel F1, check flint/gravel, sleep night ===');

// 1. Eat to full
await lib.eat();
console.log(`Food now: ${bot.food}/20, Health: ${bot.health}/20`);

// 2. Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// 3. Fuel Furnace 1 to smelt the 4 raw_iron
const f1Block = bot.blockAt(new Vec3(295, 72, -55));
if (f1Block) {
  const f1 = await bot.openFurnace(f1Block);
  console.log('F1 state:', { input: f1.inputItem()?.name, fuel: f1.fuelItem()?.name, output: f1.outputItem()?.name });
  if (f1.outputItem()) await f1.takeOutput();
  if (!f1.fuelItem()) {
    if (lib.count('coal') > 0) {
      await f1.putFuel(mcData.itemsByName.coal.id, null, 1);
      console.log('Added 1 coal to F1.');
    } else if (lib.count('birch_log') > 0) {
      await lib.craft('birch_planks', 4);
      await f1.putFuel(mcData.itemsByName.birch_planks.id, null, 4);
      console.log('Added 4 birch_planks to F1.');
    }
  }
  f1.close();
}

// 4. Check chest for flint, gravel, wool, string
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

if (chest.flint) {
  console.log(`Withdrawing ${chest.flint} flint from chest...`);
  await lib.withdraw({ flint: chest.flint }, chestPos.x, chestPos.y, chestPos.z);
}

// Craft flint and steel if we have flint and iron ingot
if (lib.count('flint_and_steel') === 0 && lib.count('flint') > 0 && lib.count('iron_ingot') > 0) {
  console.log('Crafting flint_and_steel...');
  try {
    await lib.craft('flint_and_steel', 1);
    console.log('Crafted flint_and_steel successfully!');
  } catch (e) {
    console.log('Flint and steel craft note:', e.message);
  }
}

// 5. Check Alpha
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log('Alpha is at:', lib.fmt(alpha.position), 'distance:', alpha.position.distanceTo(bot.entity.position).toFixed(1));
} else {
  console.log('Alpha entity not visible in loaded range.');
}

// 6. Wait for bedtime (tick 12542)
console.log('Waiting for sleep tick...');
const deadline = Date.now() + 50000;
while (Date.now() < deadline && !isCancelled()) {
  const t = lib.time();
  if (t.canSleep) {
    console.log(`Sleeping at tick ${t.timeOfDay}...`);
    try {
      await lib.sleepInBed();
      console.log('Slept in bed!');
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
    break;
  }
  await sleep(1500);
}

// Collect any finished iron from F1
if (f1Block) {
  const f1 = await bot.openFurnace(f1Block);
  if (f1.outputItem()) {
    console.log(`F1 Output: ${f1.outputItem().count} ${f1.outputItem().name}`);
    await f1.takeOutput();
  }
  f1.close();
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time now:', lib.time());
bot.chat(`beta: Night handled. Iron ingots: ${lib.count('iron_ingot')}, flint_and_steel: ${lib.count('flint_and_steel')}, water_bucket: ${lib.count('water_bucket')}.`);
