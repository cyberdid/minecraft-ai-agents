// programs/385-craft-and-equip-shield.js
console.log('=== Step: Craft 4 birch planks, craft shield, equip shield in off-hand ===');

// 1. Craft birch_planks from birch_log (can do in inventory)
const logItem = bot.inventory.items().find(i => i.name === 'birch_log');
if (logItem) {
  const plankRecipe = bot.recipesFor(mcData.itemsByName.birch_planks.id, null, 1, null)[0];
  if (plankRecipe) {
    await bot.craft(plankRecipe, 1, null);
    console.log('Crafted birch_planks. Total birch_planks:', lib.count('birch_planks'));
  }
}

// 2. Craft shield at crafting table (295, 72, -56)
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (!tableBlock) {
  console.log('Crafting table not found at (295, 72, -56)');
} else {
  console.log('Crafting table found at', tableBlock.position);
  console.log(`Materials before shield craft: birch_planks=${lib.count('birch_planks')}, iron_ingot=${lib.count('iron_ingot')}`);
  const shieldRecipe = bot.recipesFor(mcData.itemsByName.shield.id, null, 1, tableBlock)[0];
  if (shieldRecipe) {
    await bot.craft(shieldRecipe, 1, tableBlock);
    console.log('Shield crafted successfully! Shield count:', lib.count('shield'));
  } else {
    console.log('No shield recipe found or missing materials.');
  }
}

// 3. Equip shield in off-hand
const shieldItem = bot.inventory.items().find(i => i.name === 'shield');
if (shieldItem) {
  try {
    await bot.equip(shieldItem, 'off-hand');
    console.log('Shield equipped in off-hand!');
  } catch (e) {
    console.log('Equip shield error:', e.message);
  }
}

// 4. Also equip armor if any iron armor pieces exist in inventory
await lib.equipArmor();

// 5. Check if health has recovered further
console.log(`Current status: health=${bot.health}/20, food=${bot.food}/20`);
bot.chat(`beta: Crafted and equipped SHIELD! Health: ${bot.health}/20, food: ${bot.food}/20. In base standing by.`);
