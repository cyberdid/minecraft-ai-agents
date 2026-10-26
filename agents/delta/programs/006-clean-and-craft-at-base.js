// programs/006-clean-and-craft-at-base.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Clean any leftover items
await lib.clearCraftingGrid();
await lib.stowCursor();
console.log('Inv after cleanup:', JSON.stringify(lib.inv()));

// Head to base door
const doorPos = new Vec3(294, 72, -54);
console.log('Walking to base door at', lib.fmt(doorPos));
await lib.goTo(doorPos.x, doorPos.y, doorPos.z, 2);
await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
console.log('Inside base at:', lib.fmt(bot.entity.position));

// Find crafting table inside base
const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (!table) throw new Error('No crafting table in base');
console.log('Using crafting table at:', lib.fmt(table));
const tableBlock = bot.blockAt(table);

async function craftAtTable(itemName, countNeeded) {
  const item = mcData.itemsByName[itemName];
  if (!item) throw new Error(`Unknown item ${itemName}`);
  const recipes = bot.recipesFor(item.id, null, 1, tableBlock);
  if (!recipes.length) throw new Error(`No recipe found for ${itemName} at table`);
  const recipe = recipes[0];
  const target = lib.count(itemName) + countNeeded;
  const times = Math.ceil(countNeeded / recipe.result.count);
  console.log(`Crafting ${itemName} x${countNeeded} (times: ${times})...`);
  await bot.craft(recipe, times, tableBlock);
  await sleep(300);
  await lib.stowCursor();
  console.log(`Crafted ${itemName}, have: ${lib.count(itemName)}`);
}

// Craft sticks, stone sword, stone pickaxe, stone axe
if (lib.count('stick') < 8) {
  await craftAtTable('stick', 8);
}
if (!lib.count('stone_sword')) {
  await craftAtTable('stone_sword', 1);
}
if (!lib.count('stone_pickaxe')) {
  await craftAtTable('stone_pickaxe', 1);
}
if (!lib.count('stone_axe')) {
  await craftAtTable('stone_axe', 1);
}

await lib.equipWeapon();
console.log('Tools now:', JSON.stringify(lib.tools()));
console.log('Inv now:', JSON.stringify(lib.inv()));
bot.chat('delta: Stone tools crafted successfully at base table!');
