// programs/519-check-gold-for-boots.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== DELTA GOLD & BOOTS CRAFTING CHECK ===');
console.log(`Delta pos: ${lib.fmt(bot.entity.position)}, Gold ingots held: ${lib.count('gold_ingot')}`);

// 1. Enter base house
if (bot.entity.position.z > -54.2) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
}

// 2. Check Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
let chestGoldIngots = 0;
let chestGoldNuggets = 0;
let chestRawGold = 0;

if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log('Chest items:', items.map(i => `${i.name} x${i.count}`).join(', '));
    for (const item of items) {
      if (item.name === 'gold_ingot') chestGoldIngots += item.count;
      if (item.name === 'gold_nugget') chestGoldNuggets += item.count;
      if (item.name === 'raw_gold') chestRawGold += item.count;
    }

    // Withdraw all gold
    for (const name of ['gold_ingot', 'gold_nugget', 'raw_gold', 'golden_boots']) {
      const it = items.find(i => i.name === name);
      if (it) {
        await chest.withdraw(it.type, null, it.count);
        console.log(`Withdrew ${it.count} ${name} from Base Chest!`);
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

console.log(`Total gold ingots held now: ${lib.count('gold_ingot')}, nuggets: ${lib.count('gold_nugget')}`);

// 3. Check Furnaces at (295, 72, -55) and (295, 72, -54)
for (const fPos of [new Vec3(295, 72, -55), new Vec3(295, 72, -54)]) {
  const fBlock = bot.blockAt(fPos);
  if (fBlock) {
    try {
      const furnace = await bot.openFurnace(fBlock);
      if (furnace.outputItem()) {
        console.log(`Furnace at ${lib.fmt(fPos)} output: ${furnace.outputItem().name} x${furnace.outputItem().count}`);
        await furnace.takeOutput();
      }
      furnace.close();
    } catch (e) {}
  }
}

// 4. Craft nuggets into ingots if >= 9 nuggets
if (lib.count('gold_nugget') >= 9) {
  console.log('Crafting nuggets into ingots...');
  try {
    const table = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 5 });
    if (table) {
      const recipe = bot.recipesFor(mcData.itemsByName.gold_ingot.id, null, 1, table)[0];
      if (recipe) {
        await bot.craft(recipe, Math.floor(lib.count('gold_nugget') / 9), table);
        console.log('Crafted gold_ingot from nuggets! Total ingots:', lib.count('gold_ingot'));
      }
    }
  } catch (e) {
    console.log('Nugget craft note:', e.message);
  }
}

console.log(`Final gold ingots in inventory: ${lib.count('gold_ingot')}`);

// 5. If 4+ gold ingots, craft golden_boots!
if (lib.count('gold_ingot') >= 4) {
  console.log('Crafting golden_boots!');
  try {
    const table = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 5 });
    if (table) {
      const recipe = bot.recipesFor(mcData.itemsByName.golden_boots.id, null, 1, table)[0];
      if (recipe) {
        await bot.craft(recipe, 1, table);
        console.log('CRAFTED GOLDEN_BOOTS!');
        await bot.equip(mcData.itemsByName.golden_boots.id, 'armor');
        console.log('EQUIPPED GOLDEN_BOOTS! 100% Piglin neutrality active!');
        bot.chat('delta: Crafted and equipped golden_boots! 100% Piglin neutrality ACTIVE!');
      }
    }
  } catch (e) {
    console.log('Boots craft note:', e.message);
  }
}

return {
  ingots: lib.count('gold_ingot'),
  nuggets: lib.count('gold_nugget'),
  boots: lib.count('golden_boots'),
  inv: lib.inv()
};
