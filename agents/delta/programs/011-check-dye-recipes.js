// programs/011-check-dye-recipes.js
const b = bot;
const table = bot.findBlocks({ matching: bl => bl.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
const tableBlock = bot.blockAt(table);

// Check bed recipes
for (const color of ['white', 'gray', 'light_gray']) {
  const bedItem = mcData.itemsByName[`${color}_bed`];
  if (bedItem) {
    const recipes = b.recipesAll(bedItem.id, null, true);
    console.log(`${color}_bed recipe count:`, recipes.length);
  }
  const woolItem = mcData.itemsByName[`${color}_wool`];
  if (woolItem) {
    const recipes = b.recipesAll(woolItem.id, null, true);
    console.log(`${color}_wool recipes:`, recipes.length);
    for (const r of recipes) {
      console.log(`  recipe for ${color}_wool:`, JSON.stringify(r.ingredients));
    }
  }
}

// Check flowers nearby (32m)
const flowers = bot.findBlocks({
  matching: bl => bl.name.includes('flower') || bl.name.includes('tulip') || bl.name.includes('daisy') || bl.name.includes('bluet') || bl.name.includes('dandelion') || bl.name.includes('poppy'),
  maxDistance: 32,
  count: 10
});
console.log('Nearby flowers (32m):', flowers.map(f => bot.blockAt(f).name).join(', '));
