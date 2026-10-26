// programs/527-loot-base-furnaces-chests.js
console.log('=== Step: Inspect and Loot Base Chests and Furnaces ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Check all chests within 8m
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 8, count: 5 });
console.log(`Found ${chests.length} chests in base`);
for (const cp of chests) {
  try {
    const cBlock = bot.blockAt(cp);
    const chest = await bot.openChest(cBlock);
    const items = chest.items();
    console.log(`Chest at ${lib.fmt(cp)} has ${items.length} item types:`, items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    
    // Withdraw useful items: iron_ingot, cooked food, weapons, armor, pickaxes, coal, cobblestone
    for (const it of items) {
      if (['iron_ingot', 'raw_iron', 'cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'bread', 'iron_pickaxe', 'stone_pickaxe', 'iron_sword', 'stone_sword', 'shield', 'iron_chestplate', 'iron_leggings', 'iron_boots', 'iron_helmet', 'cobblestone', 'coal', 'charcoal'].includes(it.name)) {
        console.log(`Withdrawing ${it.name} x${it.count}...`);
        try { await chest.withdraw(it.type, null, it.count); } catch (e) {}
      }
    }
    await chest.close();
  } catch (err) {
    console.log(`Error with chest at ${lib.fmt(cp)}:`, err.message);
  }
}

// 2. Check all furnaces within 8m
const furnaceIds = [mcData.blocksByName.furnace.id, mcData.blocksByName.lit_furnace?.id].filter(Boolean);
const furnaces = bot.findBlocks({ matching: furnaceIds, maxDistance: 8, count: 6 });
console.log(`Found ${furnaces.length} furnaces in base`);
for (const fp of furnaces) {
  try {
    const fBlock = bot.blockAt(fp);
    const f = await bot.openFurnace(fBlock);
    console.log(`Furnace at ${lib.fmt(fp)}: input=${f.inputItem()?.name} x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name} x${f.fuelItem()?.count}, output=${f.outputItem()?.name} x${f.outputItem()?.count}`);
    // Take output item if any
    if (f.outputItem()) {
      console.log(`Taking furnace output ${f.outputItem().name} x${f.outputItem().count}...`);
      try { await f.takeOutput(); } catch (e) {}
    }
    await f.close();
  } catch (err) {
    console.log(`Error with furnace at ${lib.fmt(fp)}:`, err.message);
  }
}

// 3. Equip armor if we got any
await lib.equipArmor();
await lib.equipWeapon();

// 4. Report current inventory
const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Current Inventory:', inv || 'empty');

return inv;
