// programs/465-craft-planks-and-tools.js
console.log('=== Step: Craft Planks, Sticks, and Basic Tools ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Craft birch_planks from birch_log (inventory craft, no table needed)
const logItem = bot.inventory.items().find(i => i.name === 'birch_log');
if (logItem) {
  const plankRecipe = bot.recipesFor(mcData.itemsByName.birch_planks.id, null, 1, null)[0];
  if (plankRecipe) {
    await bot.craft(plankRecipe, logItem.count, null);
    console.log(`Crafted planks! Count: ${lib.count('birch_planks')}`);
  }
}

// 2. Craft sticks (inventory craft)
if (lib.count('birch_planks') >= 2) {
  const stickRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (stickRecipe) {
    await bot.craft(stickRecipe, 2, null); // 2 crafts = 8 sticks
    console.log(`Crafted sticks! Count: ${lib.count('stick')}`);
  }
}

// 3. Craft wooden_pickaxe at crafting table (295, 72, -56)
const tablePos = new Vec3(295, 72, -56);
const tableBlock = bot.blockAt(tablePos);
if (tableBlock && lib.count('wooden_pickaxe') === 0) {
  const wpRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tableBlock)[0];
  if (wpRecipe) {
    await bot.craft(wpRecipe, 1, tableBlock);
    console.log('Crafted wooden_pickaxe!');
  }
}

// 4. Mine 3-4 cobblestone from base wall/floor safely
// Block at (292, 73, -57) is cobblestone wall (safe to mine and replace or mine cobblestone floor)
// Or block at (292, 73, -58)
const cobbleTarget = new Vec3(292, 73, -57);
const cb = bot.blockAt(cobbleTarget);
if (cb && cb.name === 'cobblestone' && lib.count('wooden_pickaxe') > 0) {
  try {
    await lib.dig(cobbleTarget.x, cobbleTarget.y, cobbleTarget.z);
    console.log('Mined cobblestone from wall!');
  } catch (e) {
    console.log('Dig error:', e.message);
  }
}

// Check if any cobblestone drops picked up
console.log('Inv now:', JSON.stringify(lib.inv()));
bot.chat(`beta: Basic tool progression started. Inv: ${JSON.stringify(lib.inv())}`);
