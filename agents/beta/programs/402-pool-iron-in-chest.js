// programs/402-pool-iron-in-chest.js
console.log('=== Step: Check chest for iron ingots & coordinate boots crafting ===');

const cb = bot.blockAt(new Vec3(293, 72, -57));
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));

if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const chestIngots = chest.containerItems().find(i => i.name === 'iron_ingot');
    console.log(`Chest has ${chestIngots?.count || 0} iron ingots.`);
    
    // If chest has >= 2 iron ingots, withdraw them so Beta has 4+ ingots to craft boots!
    if (chestIngots && chestIngots.count >= 2) {
      await chest.withdraw(chestIngots.type, null, chestIngots.count);
      console.log(`Withdrew ${chestIngots.count} iron ingots from chest!`);
    } else if (lib.count('iron_ingot') > 0 && (!chestIngots || chestIngots.count < 2)) {
      // Or deposit Beta's 2 ingots so teammates can craft boots!
      console.log('Teammate pool: Beta holding 2 ingots, chest has', chestIngots?.count || 0);
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

console.log('Beta iron ingots:', lib.count('iron_ingot'));

if (tableBlock && lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots...');
  const recipe = bot.recipesFor(mcData.itemsByName.iron_boots.id, null, 1, tableBlock)[0];
  if (recipe) {
    await bot.craft(recipe, 1, tableBlock);
    console.log('Crafted iron_boots successfully!');
    await lib.equipArmor();
  }
}

bot.chat(`beta: At chest/furnaces. Holding ${lib.count('iron_ingot')} iron ingots, wearing ${bot.inventory.slots[5]?.name || 'none'} and ${bot.inventory.slots[45]?.name || 'none'}. Delta/Alpha, pool ingots in chest!`);
