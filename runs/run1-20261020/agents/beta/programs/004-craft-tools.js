const Vec3 = require('vec3');
const mcData = require('minecraft-data')(bot.version);

console.log('--- Crafting Tools ---');
const itemsBefore = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Inventory before:', itemsBefore);

// 1. Craft oak_planks from oak_log
const oakLog = bot.inventory.items().find(i => i.name === 'oak_log');
if (!oakLog) {
  throw new Error('No oak_log found in inventory!');
}
console.log(`Found ${oakLog.count} oak_log(s). Crafting planks...`);
const planksRecipe = bot.recipesFor(mcData.itemsByName.oak_planks.id, null, 1, null)[0];
if (!planksRecipe) throw new Error('No planks recipe found!');
await bot.craft(planksRecipe, oakLog.count, null);
console.log('Planks crafted.');

// 2. Craft crafting_table (1)
const tableRecipe = bot.recipesFor(mcData.itemsByName.crafting_table.id, null, 1, null)[0];
if (!tableRecipe) throw new Error('No crafting_table recipe found!');
await bot.craft(tableRecipe, 1, null);
console.log('Crafting table crafted.');

// 3. Craft sticks (2 batches = 8 sticks)
const sticksRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
if (!sticksRecipe) throw new Error('No stick recipe found!');
await bot.craft(sticksRecipe, 2, null);
console.log('Sticks crafted.');

// 4. Place crafting table to craft tools
// Find a solid ground block directly in front of bot
const feet = bot.entity.position.floored();
const offsets = [
  new Vec3(1, -1, 0),
  new Vec3(-1, -1, 0),
  new Vec3(0, -1, 1),
  new Vec3(0, -1, -1)
];

let targetRef = null;
for (const off of offsets) {
  const groundPos = feet.plus(off);
  const airPos = groundPos.offset(0, 1, 0);
  const groundBlock = bot.blockAt(groundPos);
  const airBlock = bot.blockAt(airPos);
  if (groundBlock && groundBlock.boundingBox === 'block' && airBlock && (airBlock.name === 'air' || airBlock.name === 'short_grass')) {
    if (airBlock.name === 'short_grass') {
      await bot.dig(airBlock);
    }
    targetRef = groundBlock;
    break;
  }
}

if (!targetRef) {
  // Use block below feet neighbor
  targetRef = bot.blockAt(feet.offset(0, -1, 0));
}

console.log('Placing crafting table on:', targetRef.position);
const tableItem = bot.inventory.items().find(i => i.name === 'crafting_table');
await bot.equip(tableItem, 'hand');
await bot.placeBlock(targetRef, new Vec3(0, 1, 0));
console.log('Crafting table placed.');

// Find the placed crafting table block
const tableBlock = bot.findBlock({
  matching: mcData.blocksByName.crafting_table.id,
  maxDistance: 4
});
if (!tableBlock) throw new Error('Could not find placed crafting table block!');

// 5. Craft wooden_pickaxe
const pickRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tableBlock)[0];
if (pickRecipe) {
  await bot.craft(pickRecipe, 1, tableBlock);
  console.log('Wooden pickaxe crafted.');
} else {
  console.log('Could not find wooden pickaxe recipe!');
}

// 6. Craft wooden_shovel
const shovelRecipe = bot.recipesFor(mcData.itemsByName.wooden_shovel.id, null, 1, tableBlock)[0];
if (shovelRecipe) {
  await bot.craft(shovelRecipe, 1, tableBlock);
  console.log('Wooden shovel crafted.');
} else {
  console.log('Could not find wooden shovel recipe!');
}

// 7. Craft wooden_axe
const axeRecipe = bot.recipesFor(mcData.itemsByName.wooden_axe.id, null, 1, tableBlock)[0];
if (axeRecipe) {
  await bot.craft(axeRecipe, 1, tableBlock);
  console.log('Wooden axe crafted.');
} else {
  console.log('Could not find wooden axe recipe!');
}

// 8. Dig the crafting table back up so we don't leave it behind
console.log('Picking up crafting table...');
await bot.dig(tableBlock);
await bot.waitForTicks(5);
await globalThis.collectDrops(4);

const itemsAfter = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Inventory after:', itemsAfter);

bot.chat("I've crafted wooden tools (pickaxe, shovel, axe) and am heading to (40, 79, -21) to prep the ground.");

return { inventory: itemsAfter };
