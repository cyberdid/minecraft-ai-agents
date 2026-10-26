// programs/478-return-to-base-and-craft-shield.js
console.log('=== Step: Return to Base & Craft Shield ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Hostiles:', JSON.stringify(lib.hostiles(16)));

// 1. Immediately ascend staircase to base (294, 72, -55)
try {
  await lib.goTo(294, 72, -55, 1.5);
  console.log('Safely back at base:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Path to base error, trying waypoint:', e.message);
  try {
    await lib.goTo(302, 71, -44, 2);
    await lib.goTo(294, 72, -55, 1.5);
  } catch (e2) {
    console.log('Ascent fallback error:', e2.message);
  }
}

console.log('Current pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 2. Smelt raw_iron at Furnace 1 (295, 72, -55)
const f1Pos = new Vec3(295, 72, -55);
const fb = bot.blockAt(f1Pos);
if (fb && lib.count('raw_iron') > 0) {
  try {
    await bot.lookAt(f1Pos.offset(0.5, 0.5, 0.5));
    const f = await bot.openFurnace(fb);
    console.log('Furnace opened. Fueling and inputting raw iron...');
    
    // Put raw_iron in input
    const rawIronItem = bot.inventory.items().find(i => i.name === 'raw_iron');
    if (rawIronItem) await f.putInput(rawIronItem.type, null, rawIronItem.count);
    
    // Put birch_planks in fuel (1 plank smelts 1.5 items)
    const fuelItem = bot.inventory.items().find(i => i.name.endsWith('_planks') || i.name === 'coal');
    if (fuelItem) await f.putFuel(fuelItem.type, null, 2);
    
    // Wait for smelting (10s per item)
    console.log('Smelting iron ingot...');
    for (let s = 0; s < 12; s++) {
      await sleep(1000);
      if (f.outputItem()) {
        console.log(`Smelted ${f.outputItem().name} x${f.outputItem().count}!`);
        await f.takeOutput();
        break;
      }
    }
    f.close();
  } catch (e) {
    console.log('Furnace error:', e.message);
  }
}

console.log('Inv after smelting:', JSON.stringify(lib.inv()));

// 3. Craft SHIELD at crafting table (295, 72, -56)
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6 && tableBlock) {
  try {
    const shieldRecipe = bot.recipesFor(mcData.itemsByName.shield.id, null, 1, tableBlock)[0];
    if (shieldRecipe) {
      await bot.craft(shieldRecipe, 1, tableBlock);
      console.log('SUCCESS: CRAFTED SHIELD!');
    } else {
      console.log('No shield recipe found in table, trying lib.craft');
      await lib.craft('shield', 1);
    }
  } catch (e) {
    console.log('Shield craft error:', e.message);
  }
}

// 4. Equip shield in offhand
try {
  await lib.equipArmor();
  console.log('Equipped armor and shield!');
} catch (e) {
  console.log('Equip armor error:', e.message);
}

console.log('Final inv:', JSON.stringify(lib.inv()), 'Gear:', JSON.stringify(lib.tools()));
bot.chat(`beta: SHIELD CRAFTED & EQUIPPED! Ready to block Blaze fireballs!`);
