// programs/005-test-craft.js
console.log('Inv before:', JSON.stringify(lib.inv()));
const b = bot;
const stickId = mcData.itemsByName.stick.id;
const plankId = mcData.itemsByName.oak_planks.id;
console.log('stickId:', stickId, 'plankId:', plankId);

// Check recipes for stick
const recipes = b.recipesFor(stickId, null, 1, null);
console.log('recipes without table:', recipes.length);
if (recipes.length > 0) {
  console.log('recipe 0:', JSON.stringify(recipes[0].ingredients));
}

// Check crafting grid & cursor
console.log('cursorItem:', b.inventory.cursorItem);
console.log('crafting grid slots:');
for (let i = 1; i <= 4; i++) {
  const slot = b.inventory.slots[i];
  if (slot) console.log(`slot ${i}: ${slot.name} x${slot.count}`);
}

await lib.clearCraftingGrid();
await lib.stowCursor();

// Try craft stick
try {
  const res = await lib.craft('stick', 4);
  console.log('Craft stick success! count now:', res);
} catch (e) {
  console.log('Craft stick error:', e.message);
  console.log('Error stack:', e.stack);
}
