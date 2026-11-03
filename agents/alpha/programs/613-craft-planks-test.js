// programs/613-craft-planks-test.js
console.log('=== Program 613: Craft Planks Test ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());

try {
  const item = mcData.itemsByName.birch_planks;
  const recipe = bot.recipesFor(item.id, null, 1, null)[0];
  console.log('Recipe found:', recipe ? 'yes' : 'no');
  if (recipe) {
    console.log('Crafting 2 birch_log -> 8 birch_planks...');
    await bot.craft(recipe, 2, null);
    console.log('Crafted successfully! Inv:', lib.inv());
  }
} catch (e) {
  console.log('bot.craft error:', e.message);
  try {
    await lib.craft('birch_planks', 8);
    console.log('lib.craft succeeded! Inv:', lib.inv());
  } catch (e2) {
    console.log('lib.craft error:', e2.message);
  }
}
