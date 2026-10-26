// programs/012-craft-bed-2.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

const chestPos = new Vec3(293, 72, -57);
const tablePos = new Vec3(295, 72, -56);
const bed2Pos = new Vec3(293, 72, -56);

// Withdraw materials from chest
await lib.withdraw({ bone: 1, white_wool: 1, gray_wool: 2 }, chestPos.x, chestPos.y, chestPos.z);
console.log('Withdrew items. Inv now:', JSON.stringify(lib.inv()));

const tableBlock = bot.blockAt(tablePos);

async function craftAtTable(itemName, countNeeded) {
  const item = mcData.itemsByName[itemName];
  if (!item) throw new Error(`Unknown item ${itemName}`);
  const recipes = bot.recipesFor(item.id, null, 1, tableBlock);
  if (!recipes.length) throw new Error(`No recipe for ${itemName} at table`);
  const recipe = recipes[0];
  const times = Math.ceil(countNeeded / recipe.result.count);
  console.log(`Crafting ${itemName} x${countNeeded} (times: ${times})...`);
  await bot.craft(recipe, times, tableBlock);
  await sleep(250);
  await lib.stowCursor();
  console.log(`Crafted ${itemName}, have: ${lib.count(itemName)}`);
}

// 1. Craft bone_meal from bone
await craftAtTable('bone_meal', 3);

// 2. Craft white_dye from bone_meal
await craftAtTable('white_dye', 2);

// 3. Craft white_wool from gray_wool + white_dye
await craftAtTable('white_wool', 2);
console.log('Total white_wool now:', lib.count('white_wool'));

// 4. Craft white_bed
await craftAtTable('white_bed', 1);
console.log('Have white_bed:', lib.count('white_bed'));

// 5. Place white_bed at (293, 72, -56)
console.log('Block at bed spot before:', bot.blockAt(bed2Pos).name);
const placeRes = await lib.place('white_bed', bed2Pos.x, bed2Pos.y, bed2Pos.z);
console.log('Place bed result:', placeRes);
console.log('Block at bed spot after:', bot.blockAt(bed2Pos).name);

bot.chat('delta: Crafted and placed Bed 2 at (293, 72, -56)! Milestone 4 achieved!');
