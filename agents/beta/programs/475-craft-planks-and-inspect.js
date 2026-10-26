// programs/475-craft-planks-and-inspect.js
console.log('=== Step: Craft Planks & Reach Chest ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Craft birch_planks from birch_log (inventory craft)
const logItem = bot.inventory.items().find(i => i.name === 'birch_log');
if (logItem) {
  const plankRecipe = bot.recipesFor(mcData.itemsByName.birch_planks.id, null, 1, null)[0];
  if (plankRecipe) {
    await bot.craft(plankRecipe, logItem.count, null);
    console.log(`Crafted birch_planks! Total now: ${lib.count('birch_planks')}`);
  }
}

// Check oak_planks as well
console.log('Planks now: oak=', lib.count('oak_planks'), 'birch=', lib.count('birch_planks'));

// 2. Open chest at (293, 72, -57) - we are at (292.7, 72.0, -55.5), dist is 1.5m!
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    await bot.lookAt(new Vec3(293.5, 72.5, -56.5));
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
    
    // Withdraw useful items: iron_ingot, raw_iron, coal, cooked meat, tools, armor, door
    for (const item of items) {
      if (item.name === 'iron_ingot' || item.name === 'raw_iron' || item.name === 'coal' || item.name === 'charcoal' || 
          item.name.startsWith('cooked_') || item.name.endsWith('_pickaxe') || item.name.endsWith('_sword') || 
          item.name === 'shield' || item.name === 'oak_door' || item.name.startsWith('iron_')) {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.name}x${item.count} from chest!`);
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

console.log('Inv after chest check:', JSON.stringify(lib.inv()));
