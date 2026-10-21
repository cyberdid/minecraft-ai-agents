// 1. Clear crafting grid slots
for (let s = 1; s <= 4; s++) {
  if (bot.inventory.slots[s]) {
    console.log(`Clearing slot ${s} (${bot.inventory.slots[s].name} x${bot.inventory.slots[s].count})...`);
    await bot.putAway(s);
  }
}

console.log("Inventory after clear:");
for (const item of bot.inventory.items()) {
  console.log(`- ${item.name} x${item.count} (slot ${item.slot})`);
}

// 2. Test crafting sticks
const mcData = require('minecraft-data')(bot.version);
const stickDef = mcData.itemsByName['stick'];
const recipes = bot.recipesFor(stickDef.id, null, 1, null);
console.log(`Found ${recipes.length} recipes for sticks.`);
if (recipes.length > 0) {
  console.log("Recipe:", JSON.stringify(recipes[0].inShape));
  try {
    await bot.craft(recipes[0], 1, null);
    console.log("bot.craft completed successfully!");
  } catch (err) {
    console.log("bot.craft threw error:", err.message);
  }
}

console.log("Inventory after stick craft attempt:");
for (const item of bot.inventory.items()) {
  console.log(`- ${item.name} x${item.count} (slot ${item.slot})`);
}
for (let s = 1; s <= 4; s++) {
  if (bot.inventory.slots[s]) {
    console.log(`Still in crafting slot ${s}: ${bot.inventory.slots[s].name} x${bot.inventory.slots[s].count}`);
  }
}
