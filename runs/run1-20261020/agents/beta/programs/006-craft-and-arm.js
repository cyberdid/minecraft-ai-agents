const Vec3 = require('vec3');
const mcData = globalThis.mcData;

console.log('--- Crafting Tools and Weapon ---');
await globalThis.clearCraftingGrid();

// 1. Craft sticks (1 craft = 4 sticks) from 2 oak_planks
const stickRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
if (stickRecipe) {
  console.log('Crafting 4 sticks...');
  await bot.craft(stickRecipe, 1, null);
  await bot.waitForTicks(5);
  await globalThis.clearCraftingGrid();
}

// 2. Craft planks from oak_log
const oakLog = bot.inventory.items().find(i => i.name === 'oak_log');
if (oakLog) {
  console.log(`Crafting planks from ${oakLog.count} oak log(s)...`);
  const planksRecipe = bot.recipesFor(mcData.itemsByName.oak_planks.id, null, 1, null)[0];
  await bot.craft(planksRecipe, oakLog.count, null);
  await bot.waitForTicks(5);
  await globalThis.clearCraftingGrid();
}

// 3. Place crafting table
const tableItem = bot.inventory.items().find(i => i.name === 'crafting_table');
if (!tableItem) throw new Error('Crafting table missing from inventory!');

const feet = bot.entity.position.floored();
const offsets = [
  new Vec3(1, -1, 0),
  new Vec3(-1, -1, 0),
  new Vec3(0, -1, 1),
  new Vec3(0, -1, -1)
];

let groundRef = null;
for (const off of offsets) {
  const g = bot.blockAt(feet.plus(off));
  const above = bot.blockAt(feet.plus(off).offset(0, 1, 0));
  if (g && g.boundingBox === 'block' && above && (above.name === 'air' || above.name === 'short_grass')) {
    if (above.name === 'short_grass') await bot.dig(above);
    groundRef = g;
    break;
  }
}
if (!groundRef) groundRef = bot.blockAt(feet.offset(0, -1, 0));

console.log('Placing crafting table on:', groundRef.position);
await bot.equip(tableItem, 'hand');
await bot.waitForTicks(3);
await bot.placeBlock(groundRef, new Vec3(0, 1, 0));
await bot.waitForTicks(5);

const tableBlock = bot.findBlock({
  matching: mcData.blocksByName.crafting_table.id,
  maxDistance: 4
});
if (!tableBlock) throw new Error('Crafting table block not found after placing!');
console.log('Crafting table placed at:', tableBlock.position);

// 4. Craft wooden pickaxe
const pickRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tableBlock)[0];
if (pickRecipe) {
  console.log('Crafting wooden pickaxe...');
  await bot.craft(pickRecipe, 1, tableBlock);
  await bot.waitForTicks(5);
  await globalThis.clearCraftingGrid();
}

// 5. Craft wooden sword
const swordRecipe = bot.recipesFor(mcData.itemsByName.wooden_sword.id, null, 1, tableBlock)[0];
if (swordRecipe) {
  console.log('Crafting wooden sword...');
  await bot.craft(swordRecipe, 1, tableBlock);
  await bot.waitForTicks(5);
  await globalThis.clearCraftingGrid();
}

// 6. Mine crafting table back
console.log('Retrieving crafting table...');
await bot.dig(tableBlock);
await bot.waitForTicks(5);
await globalThis.collectDrops(4);

// 7. Equip sword in hand
const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) {
  await bot.equip(sword, 'hand');
  console.log('Equipped sword for defense.');
}

const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Inventory now:', inv);

bot.chat("Got wooden pickaxe, sword, and crafting table! Advancing safely.");

return { inv };
