// programs/056-take-furnace-cook-eat-sleep.js
// Open furnace, harvest whatever is in output (iron ingots or food!), cook chicken, eat, sleep!

console.log('alpha at:', lib.fmt(bot.entity.position), 'food:', bot.food);

const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    console.log('Opening furnace at (295, 72, -55)...');
    const furnace = await bot.openFurnace(furnaceBlock);
    const out = furnace.outputItem();
    console.log('Furnace output:', out ? `${out.name} x${out.count}` : 'empty');
    if (out) {
      console.log(`Taking ${out.count} ${out.name} from furnace...`);
      await furnace.takeOutput();
      console.log('Retrieved output from furnace!');
    }

    // Now cook chicken if we have chicken
    if (lib.count('chicken') > 0) {
      console.log('Putting 1 raw chicken into furnace input...');
      await furnace.putInput(mcData.itemsByName.chicken.id, null, 1);
      if (!furnace.fuelItem()) {
        await furnace.putFuel(mcData.itemsByName.oak_planks.id, null, 1);
      }
    }
    furnace.close();
  } catch (e) {
    console.log('Furnace note:', e.message);
  }
}

console.log('Inventory after checking furnace:', JSON.stringify(lib.inv()));
console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// If we have >= 8 iron ingots, craft iron_chestplate!
if (lib.count('iron_chestplate') === 0 && lib.count('iron_ingot') >= 8) {
  try {
    await lib.craft('iron_chestplate', 1);
    console.log('CRAFTED ALPHA IRON_CHESTPLATE!');
    await lib.equipArmor();
  } catch (e) {
    console.log('Craft chestplate note:', e.message);
  }
}

// Wait 12s for chicken to cook
if (lib.count('chicken') > 0 || lib.count('cooked_chicken') === 0) {
  console.log('Waiting 12s for chicken to cook...');
  await sleep(12000);
  if (furnaceBlock) {
    try {
      const f = await bot.openFurnace(furnaceBlock);
      if (f.outputItem()) {
        console.log(`Taking cooked food: ${f.outputItem().name} x${f.outputItem().count}`);
        await f.takeOutput();
      }
      f.close();
    } catch (e) {}
  }
}

// Eat cooked food
if (lib.count('cooked_chicken') > 0 || lib.count('cooked_beef') > 0 || lib.count('cooked_mutton') > 0) {
  console.log('Eating cooked food...');
  try {
    await lib.eat();
    console.log('Food level now:', bot.food);
  } catch (e) {
    console.log('Eat note:', e.message);
  }
}

// Equip armor
await lib.equipArmor();
await lib.equipWeapon();

const slots = bot.inventory.slots;
console.log('CURRENT ARMOR:');
console.log('  Head:', slots[5]?.name);
console.log('  Torso:', slots[6]?.name);
console.log('  Legs:', slots[7]?.name);
console.log('  Feet:', slots[8]?.name);
console.log('  Offhand:', slots[45]?.name);

// Sleep in bed
const time = lib.time();
if (time.canSleep || time.timeOfDay >= 12542) {
  bot.chat('alpha: In bed sleeping with beta to skip night.');
  try {
    await lib.sleepInBed();
    console.log('In bed sleeping!');
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

return {
  worn: {
    head: slots[5]?.name,
    torso: slots[6]?.name,
    legs: slots[7]?.name,
    feet: slots[8]?.name,
    offhand: slots[45]?.name
  },
  food: bot.food,
  time: time.secondsUntilNight
};
