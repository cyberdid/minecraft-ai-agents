// programs/418-smelt-full-armor.js
console.log('=== Step: Parallel smelt 12 raw iron in F1 & F2, craft chestplate + boots, equip full armor ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log(`Beta holding raw_iron=${lib.count('raw_iron')}, coal=${lib.count('coal')}`);

const fb1 = bot.blockAt(new Vec3(295, 72, -55));
const fb2 = bot.blockAt(new Vec3(295, 72, -57));
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));

// 1. Load F1 (6 raw iron, 1 coal)
if (fb1) {
  try {
    const f1 = await bot.openFurnace(fb1);
    // Take any leftover output
    if (f1.outputItem()?.count > 0) await f1.takeOutput();
    if (!f1.fuelItem() && lib.count('coal') > 0) {
      await f1.putFuel(mcData.itemsByName.coal.id, null, 1);
    }
    const toPut1 = Math.min(6, lib.count('raw_iron'));
    if (toPut1 > 0) {
      await f1.putInput(mcData.itemsByName.raw_iron.id, null, toPut1);
      console.log(`Loaded ${toPut1} raw_iron into F1.`);
    }
    f1.close();
  } catch (e) {
    console.log('F1 setup error:', e.message);
  }
}

// 2. Load F2 (remaining raw iron, 1 coal)
if (fb2) {
  try {
    const f2 = await bot.openFurnace(fb2);
    if (f2.outputItem()?.count > 0) await f2.takeOutput();
    if (!f2.fuelItem() && lib.count('coal') > 0) {
      await f2.putFuel(mcData.itemsByName.coal.id, null, 1);
    }
    const toPut2 = lib.count('raw_iron');
    if (toPut2 > 0) {
      await f2.putInput(mcData.itemsByName.raw_iron.id, null, toPut2);
      console.log(`Loaded ${toPut2} raw_iron into F2.`);
    }
    f2.close();
  } catch (e) {
    console.log('F2 setup error:', e.message);
  }
}

// 3. Monitor both furnaces for ~65 seconds until 12 ingots are ready
console.log('Parallel smelting in progress...');
const startTime = Date.now();
while (Date.now() - startTime < 70000 && !isCancelled()) {
  await sleep(6000);
  let totalIngots = lib.count('iron_ingot');
  
  // Check F1
  if (fb1) {
    try {
      const f1 = await bot.openFurnace(fb1);
      const out = f1.outputItem();
      if (out && out.count > 0) {
        await f1.takeOutput();
        console.log(`Took ${out.count} ingots from F1`);
      }
      f1.close();
    } catch (e) {}
  }

  // Check F2
  if (fb2) {
    try {
      const f2 = await bot.openFurnace(fb2);
      const out = f2.outputItem();
      if (out && out.count > 0) {
        await f2.takeOutput();
        console.log(`Took ${out.count} ingots from F2`);
      }
      f2.close();
    } catch (e) {}
  }

  console.log(`Current iron ingots collected: ${lib.count('iron_ingot')}/12`);
  if (lib.count('iron_ingot') >= 12) {
    console.log('All 12 iron ingots collected!');
    break;
  }
}

console.log(`Smelting stage ended. Total iron_ingot: ${lib.count('iron_ingot')}`);

// 4. Craft iron_chestplate (8 ingots)
if (tableBlock && lib.count('iron_ingot') >= 8) {
  console.log('Crafting iron_chestplate...');
  const cr = bot.recipesFor(mcData.itemsByName.iron_chestplate.id, null, 1, tableBlock)[0];
  if (cr) {
    await bot.craft(cr, 1, tableBlock);
    console.log('Crafted iron_chestplate successfully!');
  }
}

// 5. Craft iron_boots (4 ingots)
if (tableBlock && lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots...');
  const br = bot.recipesFor(mcData.itemsByName.iron_boots.id, null, 1, tableBlock)[0];
  if (br) {
    await bot.craft(br, 1, tableBlock);
    console.log('Crafted iron_boots successfully!');
  }
}

// 6. Equip full armor
console.log('Equipping all armor pieces...');
await lib.equipArmor();

// 7. Verify all armor slots
console.log('=== FINAL ARMOR VERIFICATION ===');
const slots = {
  helmet: bot.inventory.slots[5]?.name,
  chestplate: bot.inventory.slots[6]?.name,
  leggings: bot.inventory.slots[7]?.name,
  boots: bot.inventory.slots[8]?.name,
  offhand: bot.inventory.slots[45]?.name
};
console.log(JSON.stringify(slots, null, 2));

const fullArmor = slots.helmet === 'iron_helmet' && 
                  slots.chestplate === 'iron_chestplate' && 
                  slots.leggings === 'iron_leggings' && 
                  slots.boots === 'iron_boots' && 
                  slots.offhand === 'shield';

if (fullArmor) {
  console.log('*** FULL IRON ARMOR + SHIELD ACHIEVED FOR BETA! ***');
  bot.chat('beta: MILESTONE 3 COMPLETE FOR BETA! Worn: full iron armor (helmet, chestplate, leggings, boots) + shield! Nether ready!');
} else {
  bot.chat(`beta: Armor status: helmet=${slots.helmet}, chest=${slots.chestplate}, legs=${slots.leggings}, boots=${slots.boots}, shield=${slots.offhand}.`);
}
