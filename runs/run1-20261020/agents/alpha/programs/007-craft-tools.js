const Vec3 = require('vec3').Vec3;
const mcData = require('minecraft-data')(bot.version);

async function cleanCraftingGrid() {
  for (let s = 1; s <= 4; s++) {
    if (bot.inventory.slots[s]) {
      try {
        await bot.putAway(s);
      } catch (err) {}
    }
  }
}

await cleanCraftingGrid();

// 1. Craft crafting_table
const tableDef = mcData.itemsByName['crafting_table'];
const tableRecipes = bot.recipesFor(tableDef.id, null, 1, null);
console.log(`Crafting table recipes: ${tableRecipes.length}`);
if (tableRecipes.length === 0) {
  throw new Error("No recipe for crafting table with current items");
}

await bot.craft(tableRecipes[0], 1, null);
console.log("Crafted crafting_table!");
await cleanCraftingGrid();

// Verify crafting_table is in inventory
const tableItem = bot.inventory.items().find(i => i.name === 'crafting_table');
if (!tableItem) {
  throw new Error("Crafting table not in inventory after craft!");
}
console.log(`Crafting table in slot ${tableItem.slot}`);

// 2. Find a solid block to place it on
const feet = bot.entity.position.floored();
let refBlock = null;
const candidates = [
  new Vec3(1, -1, 0),
  new Vec3(-1, -1, 0),
  new Vec3(0, -1, 1),
  new Vec3(0, -1, -1),
  new Vec3(1, -1, 1)
];

for (const c of candidates) {
  const gp = feet.plus(c);
  const gb = bot.blockAt(gp);
  const space = bot.blockAt(gp.offset(0, 1, 0));
  if (gb && gb.name !== 'air' && gb.name !== 'water' && space && (space.name === 'air' || space.name === 'cave_air')) {
    refBlock = gb;
    break;
  }
}

if (!refBlock) {
  throw new Error("No suitable reference block found to place crafting table");
}

console.log(`Placing crafting table on ${refBlock.name} at ${refBlock.position}...`);
await bot.equip(tableItem, 'hand');
await bot.placeBlock(refBlock, new Vec3(0, 1, 0));
await bot.waitForTicks(10);

const placedPos = refBlock.position.offset(0, 1, 0);
const tableBlock = bot.blockAt(placedPos);
console.log(`Placed block at ${placedPos}: ${tableBlock.name}`);

// 3. Craft wooden_pickaxe
const pickDef = mcData.itemsByName['wooden_pickaxe'];
const pickRecipes = bot.recipesFor(pickDef.id, null, 1, tableBlock);
console.log(`Wooden pickaxe recipes at table: ${pickRecipes.length}`);
if (pickRecipes.length > 0) {
  await bot.craft(pickRecipes[0], 1, tableBlock);
  console.log("Successfully crafted wooden_pickaxe!");
  await bot.waitForTicks(5);
}

// 4. Craft wooden_axe
const axeDef = mcData.itemsByName['wooden_axe'];
const axeRecipes = bot.recipesFor(axeDef.id, null, 1, tableBlock);
console.log(`Wooden axe recipes at table: ${axeRecipes.length}`);
if (axeRecipes.length > 0) {
  await bot.craft(axeRecipes[0], 1, tableBlock);
  console.log("Successfully crafted wooden_axe!");
  await bot.waitForTicks(5);
}

// 5. Dig the crafting table back
console.log("Digging crafting table back up...");
await bot.dig(tableBlock);
await bot.waitForTicks(10);

// Pick up dropped table
const drops = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 5);
const { goals } = require('mineflayer-pathfinder');
for (const d of drops) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(d.position.x, d.position.y, d.position.z, 0.5));
  } catch (e) {}
}

console.log("Current inventory:");
for (const item of bot.inventory.items()) {
  console.log(`- ${item.name} x${item.count}`);
}
