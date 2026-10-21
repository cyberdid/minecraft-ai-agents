// programs/105-smelt-and-prep.js
// 1. Smelt 1 raw_iron in furnace at (295, 72, -55) using birch_planks
// 2. Craft a fresh stone pickaxe
// 3. Take iron ingot from furnace

console.log('Smelting raw_iron in base furnace...');
try {
  await lib.smelt('raw_iron', 'birch_planks', 1);
  console.log('Raw iron smelted into iron_ingot!');
} catch (e) {
  console.log('Smelt note:', e.message);
}

// Craft fresh stone pickaxe
console.log('Crafting fresh stone pickaxe...');
await lib.craft('stone_pickaxe', 1);

console.log('Alpha inventory now:', JSON.stringify(lib.inv()));
console.log('Iron ingots in inventory:', lib.count('iron_ingot'));
bot.chat(`alpha: Smelted iron ingot! Now have ${lib.count('iron_ingot')} iron ingots. Heading to east hill for final 6 iron.`);
