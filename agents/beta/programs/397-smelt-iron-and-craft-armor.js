// programs/397-smelt-iron-and-craft-armor.js
console.log('=== Step: Load raw iron into furnace, smelt, craft armor piece ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Load F1 at (295, 72, -55)
const fb1 = bot.blockAt(new Vec3(295, 72, -55));
if (fb1) {
  try {
    const f1 = await bot.openFurnace(fb1);
    const inItem = f1.inputItem();
    const fuelItem = f1.fuelItem();
    const outItem = f1.outputItem();
    console.log(`F1 before: in=${inItem?.name}x${inItem?.count}, fuel=${fuelItem?.name}x${fuelItem?.count}, out=${outItem?.name}x${outItem?.count}`);
    
    // Take any finished output
    if (outItem && outItem.count > 0) {
      await f1.takeOutput();
      console.log(`Took ${outItem.count} ${outItem.name} from F1`);
    }

    // Add fuel if needed
    if (!fuelItem && lib.count('coal') > 0) {
      await f1.putFuel(mcData.itemsByName.coal.id, null, Math.min(lib.count('coal'), 2));
      console.log('Added coal fuel to F1.');
    }

    // Put raw iron into input
    if (lib.count('raw_iron') > 0) {
      await f1.putInput(mcData.itemsByName.raw_iron.id, null, lib.count('raw_iron'));
      console.log('Put raw_iron into F1.');
    }

    f1.close();
  } catch (e) {
    console.log('F1 error:', e.message);
  }
}

// 2. Check chest (293, 72, -57) for existing iron ingots or food
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const ingots = chest.containerItems().find(i => i.name === 'iron_ingot');
    if (ingots) {
      await chest.withdraw(ingots.type, null, ingots.count);
      console.log(`Withdrew ${ingots.count} iron_ingot from chest.`);
    }
    const foods = chest.containerItems().filter(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'].includes(i.name));
    for (const fd of foods) {
      await chest.withdraw(fd.type, null, Math.min(fd.count, 2));
      console.log(`Withdrew ${fd.name} from chest.`);
      break;
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 3. Monitor F1 and harvest iron ingots for 40 seconds
for (let s = 0; s < 8; s++) {
  await sleep(5000);
  if (isCancelled()) break;
  try {
    const f1 = await bot.openFurnace(fb1);
    const out = f1.outputItem();
    console.log(`Smelting progress... F1 output: ${out?.name}x${out?.count}`);
    if (out && out.count >= 4) {
      await f1.takeOutput();
      console.log(`Took ${out.count} iron_ingot from F1!`);
      f1.close();
      break;
    }
    f1.close();
  } catch (e) {}
}

console.log('Iron ingots currently in inventory:', lib.count('iron_ingot'));

// 4. Craft armor piece if we have 4+ ingots
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (tableBlock && lib.count('iron_ingot') >= 4) {
  // Determine what to craft: boots (4), helmet (5), leggings (7)
  let targetArmor = 'iron_boots';
  if (lib.count('iron_ingot') >= 7) targetArmor = 'iron_leggings';
  else if (lib.count('iron_ingot') >= 5) targetArmor = 'iron_helmet';

  console.log(`Attempting to craft ${targetArmor}...`);
  const recipe = bot.recipesFor(mcData.itemsByName[targetArmor].id, null, 1, tableBlock)[0];
  if (recipe) {
    await bot.craft(recipe, 1, tableBlock);
    console.log(`Successfully crafted ${targetArmor}!`);
  } else {
    // Fallback to boots if helmet/leggings recipe not matched
    const bootsRecipe = bot.recipesFor(mcData.itemsByName.iron_boots.id, null, 1, tableBlock)[0];
    if (bootsRecipe) {
      await bot.craft(bootsRecipe, 1, tableBlock);
      console.log('Crafted iron_boots as fallback!');
    }
  }
}

// 5. Equip armor
await lib.equipArmor();

console.log('Beta gear now:');
for (const s of [5, 6, 7, 8, 45]) {
  const item = bot.inventory.slots[s];
  if (item) console.log(`  slot ${s}: ${item.name}`);
}

bot.chat(`beta: Smelting update: Holding ${lib.count('iron_ingot')} ingots. Armor equipped. Standing by in base.`);
