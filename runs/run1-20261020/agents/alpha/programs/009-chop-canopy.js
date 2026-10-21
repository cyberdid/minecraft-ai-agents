const { Vec3 } = require('vec3');
const mcData = require('minecraft-data')(bot.version);

console.log("Starting canopy chop...");

const targetPositions = [
  new Vec3(35, 85, -17),
  new Vec3(35, 85, -16),
  new Vec3(36, 85, -16),
  new Vec3(35, 84, -17),
  new Vec3(35, 84, -16)
];

for (const pos of targetPositions) {
  if (isCancelled()) break;
  const blk = bot.blockAt(pos);
  if (blk && blk.name.endsWith('_log')) {
    console.log(`Digging ${blk.name} at ${pos}...`);
    try {
      await bot.lookAt(pos.offset(0.5, 0.5, 0.5));
      await bot.dig(blk);
      console.log(`Chopped ${blk.name} at ${pos}`);
      await bot.waitForTicks(5);
    } catch (e) {
      console.log(`Error digging at ${pos}:`, e.message);
    }
  }
}

// Collect drops right around feet
console.log("Picking up drops on canopy...");
const drops = Object.values(bot.entities).filter(e => e && e.name === 'item' && e.position && e.position.y >= 83 && e.position.distanceTo(bot.entity.position) < 5);
for (const d of drops) {
  const { goals } = require('mineflayer-pathfinder');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(d.position.x, d.position.y, d.position.z, 0.5));
    await bot.waitForTicks(5);
  } catch (e) {}
}

console.log("Inventory after canopy chopping:");
for (const item of bot.inventory.items()) {
  console.log(`- ${item.name} x${item.count}`);
}

// Clear crafting slots
for (let s = 1; s <= 4; s++) {
  if (bot.inventory.slots[s]) await bot.putAway(s);
}

// Craft planks from logs
for (const item of bot.inventory.items()) {
  if (item.name.endsWith('_log')) {
    const plankName = item.name.replace('_log', '_planks');
    const plankDef = mcData.itemsByName[plankName];
    if (plankDef) {
      const recipes = bot.recipesFor(plankDef.id, null, 1, null);
      if (recipes.length > 0) {
        try {
          await bot.craft(recipes[0], item.count, null);
          console.log(`Crafted ${plankName} (count: ${item.count * 4})`);
        } catch (e) {
          console.log("Craft error:", e.message);
        }
      }
    }
  }
}

// Craft 1 crafting_table
const tableDef = mcData.itemsByName['crafting_table'];
const tableRecipes = bot.recipesFor(tableDef.id, null, 1, null);
if (tableRecipes.length > 0) {
  try {
    await bot.craft(tableRecipes[0], 1, null);
    console.log("Crafted crafting_table!");
  } catch (e) {}
}

// Craft 4 sticks
const stickDef = mcData.itemsByName['stick'];
const stickRecipes = bot.recipesFor(stickDef.id, null, 1, null);
if (stickRecipes.length > 0) {
  try {
    await bot.craft(stickRecipes[0], 1, null);
    console.log("Crafted 4 sticks!");
  } catch (e) {}
}

for (let s = 1; s <= 4; s++) {
  if (bot.inventory.slots[s]) await bot.putAway(s);
}

console.log("Final inventory:", bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));
bot.chat("Gathered wood on canopy, crafting table and tools ready!");
