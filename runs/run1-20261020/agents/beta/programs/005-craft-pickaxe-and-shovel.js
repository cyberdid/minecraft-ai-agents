const Vec3 = require('vec3');
const mcData = require('minecraft-data')(bot.version);

console.log('--- Crafting Planks, Sticks, Pickaxe & Shovel ---');

// 1. Convert oak_logs to planks
const oakLog = bot.inventory.items().find(i => i.name === 'oak_log');
if (oakLog) {
  console.log(`Crafting planks from ${oakLog.count} oak logs...`);
  const planksRecipe = bot.recipesFor(mcData.itemsByName.oak_planks.id, null, 1, null)[0];
  await bot.craft(planksRecipe, oakLog.count, null);
  await bot.waitForTicks(5);
}

// 2. Craft sticks
console.log('Crafting sticks...');
const stickRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
if (stickRecipe) {
  await bot.craft(stickRecipe, 1, null); // 1 craft = 4 sticks
  await bot.waitForTicks(5);
}

// 3. Place crafting table
const tableItem = bot.inventory.items().find(i => i.name === 'crafting_table');
if (!tableItem) throw new Error('Crafting table not in inventory!');

// Find solid ground nearby
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
if (!tableBlock) throw new Error('Could not find placed crafting table block!');
console.log('Crafting table placed at:', tableBlock.position);

// 4. Craft wooden pickaxe
const pickRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tableBlock)[0];
if (pickRecipe) {
  console.log('Crafting wooden pickaxe...');
  await bot.craft(pickRecipe, 1, tableBlock);
  await bot.waitForTicks(5);
}

// 5. Craft wooden shovel
const shovelRecipe = bot.recipesFor(mcData.itemsByName.wooden_shovel.id, null, 1, tableBlock)[0];
if (shovelRecipe) {
  console.log('Crafting wooden shovel...');
  await bot.craft(shovelRecipe, 1, tableBlock);
  await bot.waitForTicks(5);
}

// 6. Mine crafting table back
console.log('Mining crafting table back...');
await bot.dig(tableBlock);
await bot.waitForTicks(5);
await globalThis.collectDrops(4);

const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Inventory now:', inv);

return { inv };
