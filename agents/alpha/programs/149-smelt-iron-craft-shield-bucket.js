// programs/149-smelt-iron-craft-shield-bucket.js
console.log('--- Smelting Iron, Crafting Shield and Bucket ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', lib.time().secondsUntilNight);

// Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// 1. Check and fuel furnace at (295, 72, -55)
const furnCoord = new Vec3(295, 72, -55);
const furnBlock = bot.blockAt(furnCoord);

if (furnBlock) {
  try {
    const furn = await bot.openFurnace(furnBlock);
    console.log(`Furnace: input=${furn.inputItem()?.name}x${furn.inputItem()?.count}, fuel=${furn.fuelItem()?.name}x${furn.fuelItem()?.count}, output=${furn.outputItem()?.name}x${furn.outputItem()?.count}`);
    
    // If output is already there, take it
    if (furn.outputItem()) {
      await furn.takeOutput();
      console.log('Took output from furnace.');
    }
    
    // If there is input raw_iron but no fuel, add birch planks
    if (furn.inputItem() && (!furn.fuelItem() || furn.fuelItem()?.count === 0)) {
      console.log('Adding 3 birch planks as fuel...');
      const plank = bot.inventory.items().find(i => i.name.endsWith('_planks'));
      if (plank) {
        await furn.putFuel(plank.type, null, 3);
      }
    }
    furn.close();
  } catch (e) {
    console.log('Furnace error:', e.message);
  }
}

// Wait for smelting to finish (each item takes ~10s)
console.log('Waiting for smelting...');
for (let wait = 0; wait < 45; wait++) {
  if (isCancelled()) break;
  await sleep(1000);
  
  // Check output periodically
  if (wait % 8 === 0) {
    try {
      const furn = await bot.openFurnace(furnBlock);
      if (furn.outputItem()) {
        console.log(`Taking ${furn.outputItem().name}x${furn.outputItem().count}...`);
        await furn.takeOutput();
      }
      const inItem = furn.inputItem();
      furn.close();
      if (!inItem) {
        console.log('Furnace input empty, smelting finished!');
        break;
      }
    } catch (e) {}
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
const ironCount = lib.count('iron_ingot');
console.log('Total iron ingots in inventory:', ironCount);

// 2. Craft Shield
if (ironCount >= 1 && lib.count('*_planks') >= 6 && lib.count('shield') === 0) {
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
    await lib.equipArmor();
    console.log('Shield crafted and equipped!');
  } catch (e) {
    console.log('Shield craft error:', e.message);
  }
}

// 3. Craft Bucket
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0) {
  console.log('Crafting bucket...');
  try {
    await lib.craft('bucket', 1);
    console.log('Bucket crafted!');
  } catch (e) {
    console.log('Bucket craft error:', e.message);
  }
}

// 4. Verify gear & ask Beta about wool
await lib.equipArmor();
const offhand = bot.inventory.slots[45];
console.log('Offhand item:', offhand?.name);
console.log('Armor worn:', bot.inventory.slots.slice(5, 9).map(s => s?.name));

bot.chat('alpha: Crafted shield and equipped! Smelting iron for bucket. Beta, do you have wool or string?');

console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Time:', lib.time().timeOfDay, '| night in:', lib.time().secondsUntilNight);
