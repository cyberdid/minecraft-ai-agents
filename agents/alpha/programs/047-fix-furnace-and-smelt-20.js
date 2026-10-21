// programs/047-fix-furnace-and-smelt-20.js
// Inspect and clear furnace, load 20 raw iron, harvest ingots, craft and equip armor!

console.log('alpha at:', lib.fmt(bot.entity.position));

const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (!furnaceBlock) {
  console.log('Furnace block not found at (295, 72, -55)');
  return;
}

console.log('Opening furnace...');
const furnace = await bot.openFurnace(furnaceBlock);

console.log('Furnace State:');
console.log('  Input:', furnace.inputItem() ? `${furnace.inputItem().name} x${furnace.inputItem().count}` : 'empty');
console.log('  Fuel:', furnace.fuelItem() ? `${furnace.fuelItem().name} x${furnace.fuelItem().count}` : 'empty');
console.log('  Output:', furnace.outputItem() ? `${furnace.outputItem().name} x${furnace.outputItem().count}` : 'empty');

// 1. Clear output
if (furnace.outputItem()) {
  console.log(`Taking output: ${furnace.outputItem().name} x${furnace.outputItem().count}`);
  await furnace.takeOutput();
}

// 2. Clear input if not raw_iron
if (furnace.inputItem() && furnace.inputItem().name !== 'raw_iron') {
  console.log(`Taking non-iron input: ${furnace.inputItem().name}`);
  await furnace.takeInput();
}

// 3. Put 20 raw iron into input
const rawCount = lib.count('raw_iron');
console.log('Raw iron in inventory:', rawCount);
if (rawCount > 0) {
  try {
    console.log(`Putting ${rawCount} raw iron into input...`);
    await furnace.putInput(mcData.itemsByName.raw_iron.id, null, rawCount);
    console.log('Raw iron loaded successfully!');
  } catch (e) {
    console.log('putInput error:', e.message);
  }
}

// 4. Ensure fuel
if (!furnace.fuelItem() || furnace.fuelItem().count < 2) {
  try {
    console.log('Adding fuel...');
    if (lib.count('*_log') > 0) {
      await furnace.putFuel(mcData.itemsByName.birch_log.id, null, lib.count('birch_log'));
    } else if (lib.count('*_planks') > 0) {
      await furnace.putFuel(mcData.itemsByName.oak_planks.id, null, lib.count('*_planks'));
    }
    console.log('Fuel loaded successfully!');
  } catch (e) {
    console.log('putFuel error:', e.message);
  }
}

furnace.close();
console.log('Furnace reloaded and running!');

// 5. Smelt loop: harvest ingots and craft armor
console.log('Monitoring smelting...');
for (let i = 0; i < 10; i++) {
  await sleep(8000);
  if (lib.time().secondsUntilNight < 30) break;
  try {
    const f = await bot.openFurnace(furnaceBlock);
    if (f.outputItem() && f.outputItem().name === 'iron_ingot') {
      const c = f.outputItem().count;
      console.log(`Harvesting ${c} iron ingots...`);
      await f.takeOutput();
    }
    f.close();
  } catch (e) {
    console.log('Harvest error:', e.message);
  }

  console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

  // Craft chestplate (8)
  if (lib.count('iron_chestplate') === 0 && lib.count('iron_ingot') >= 8) {
    await lib.craft('iron_chestplate', 1);
    console.log('Crafted iron_chestplate!');
    await lib.equipArmor();
  }
  // Craft leggings (7)
  if (lib.count('iron_leggings') === 0 && lib.count('iron_ingot') >= 7) {
    await lib.craft('iron_leggings', 1);
    console.log('Crafted iron_leggings!');
    await lib.equipArmor();
  }
  // Craft helmet (5)
  if (lib.count('iron_helmet') === 0 && lib.count('iron_ingot') >= 5) {
    await lib.craft('iron_helmet', 1);
    console.log('Crafted iron_helmet!');
    await lib.equipArmor();
  }
}

await lib.equipArmor();
await lib.equipWeapon();

const slots = bot.inventory.slots;
console.log('Worn Armor:');
console.log('  Head:', slots[5]?.name);
console.log('  Torso:', slots[6]?.name);
console.log('  Legs:', slots[7]?.name);
console.log('  Feet:', slots[8]?.name);
console.log('  Offhand:', slots[45]?.name);

bot.chat(`alpha: Armor update: head=${slots[5]?.name}, torso=${slots[6]?.name}, legs=${slots[7]?.name}, feet=${slots[8]?.name}, offhand=${slots[45]?.name}`);

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  worn: {
    head: slots[5]?.name,
    torso: slots[6]?.name,
    legs: slots[7]?.name,
    feet: slots[8]?.name,
    offhand: slots[45]?.name
  },
  time: time.secondsUntilNight
};
