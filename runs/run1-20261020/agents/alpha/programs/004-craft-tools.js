const Vec3 = require('vec3').Vec3;
const mcData = require('minecraft-data')(bot.version);

console.log("Starting crafting sequence...");
console.log("Current inventory:", bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));

// 1. Craft sticks in 2x2 crafting grid
const stickDef = mcData.itemsByName['stick'];
const stickRecipes = bot.recipesFor(stickDef.id, null, 1, null);
if (stickRecipes.length > 0) {
  console.log("Crafting sticks...");
  try {
    await bot.craft(stickRecipes[0], 2, null); // 2 crafts = 8 sticks
    console.log("Crafted 8 sticks!");
  } catch (e) {
    console.log("Error crafting sticks:", e.message);
  }
} else {
  console.log("No recipe found for sticks in 2x2");
}

// 2. Place crafting table
const tableItem = bot.inventory.items().find(i => i.name === 'crafting_table');
if (!tableItem) {
  console.log("Crafting table item not found in inventory!");
  return;
}

// Find a suitable ground block adjacent to bot
const groundPos = bot.entity.position.floored().offset(1, -1, 0);
let groundBlock = bot.blockAt(groundPos);
if (!groundBlock || groundBlock.name === 'air') {
  // Try another adjacent position
  for (const [dx, dz] of [[0, 1], [-1, 0], [0, -1], [1, 1]]) {
    const p = bot.entity.position.floored().offset(dx, -1, dz);
    const b = bot.blockAt(p);
    const airAbove = bot.blockAt(p.offset(0, 1, 0));
    if (b && b.name !== 'air' && airAbove && airAbove.name === 'air') {
      groundBlock = b;
      break;
    }
  }
}

console.log(`Placing crafting table on top of ${groundBlock.name} at ${groundBlock.position}...`);
await bot.equip(tableItem, 'hand');
const placePos = groundBlock.position.offset(0, 1, 0);
await bot.placeBlock(groundBlock, new Vec3(0, 1, 0));
await bot.waitForTicks(5);

const placedTableBlock = bot.blockAt(placePos);
console.log(`Placed block at ${placePos}: ${placedTableBlock.name}`);

// 3. Craft wooden_pickaxe
const pickDef = mcData.itemsByName['wooden_pickaxe'];
const pickRecipes = bot.recipesFor(pickDef.id, null, 1, placedTableBlock);
if (pickRecipes.length > 0) {
  console.log("Crafting wooden_pickaxe...");
  try {
    await bot.craft(pickRecipes[0], 1, placedTableBlock);
    console.log("Crafted wooden_pickaxe!");
  } catch (e) {
    console.log("Error crafting wooden_pickaxe:", e.message);
  }
} else {
  console.log("No recipe found for wooden_pickaxe at crafting table");
}

// 4. Craft wooden_axe
const axeDef = mcData.itemsByName['wooden_axe'];
const axeRecipes = bot.recipesFor(axeDef.id, null, 1, placedTableBlock);
if (axeRecipes.length > 0) {
  console.log("Crafting wooden_axe...");
  try {
    await bot.craft(axeRecipes[0], 1, placedTableBlock);
    console.log("Crafted wooden_axe!");
  } catch (e) {
    console.log("Error crafting wooden_axe:", e.message);
  }
} else {
  console.log("No recipe found for wooden_axe at crafting table");
}

// 5. Retrieve the crafting table
console.log("Retrieving crafting table...");
await bot.dig(placedTableBlock);
await bot.waitForTicks(10);

// Collect table item drop
const drops = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 5);
for (const d of drops) {
  const { goals } = require('mineflayer-pathfinder');
  await bot.pathfinder.goto(new goals.GoalNear(d.position.x, d.position.y, d.position.z, 0.5));
}

console.log("Crafting routine complete!");
console.log("Final inventory:", bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));
