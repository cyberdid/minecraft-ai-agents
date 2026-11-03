// programs/758-craft-and-equip-golden-boots.js
console.log('=== Program 758: Craft & Equip Golden Boots on Crafting Table ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);
console.log('Nuggets on Beta:', lib.count('gold_nugget'));

bot.clearControlStates();
bot.pathfinder.stop();

// Find crafting table at (295, 72, -56)
const tableBlock = bot.blockAt(new Vec3(295, 72, -56)) || bot.findBlock({
  matching: b => b && b.name.includes('crafting_table'),
  maxDistance: 6
});

if (!tableBlock) {
  throw new Error('Crafting table not found at (295, 72, -56)');
}

console.log('Found crafting table at:', lib.fmt(tableBlock.position));
await bot.lookAt(tableBlock.position.offset(0.5, 0.5, 0.5), true);

// Step 1: Craft 4 gold ingots using crafting table (3x3 grid)
const ingotRecipes = bot.recipesFor(mcData.itemsByName.gold_ingot.id, null, 1, tableBlock);
console.log('Ingot recipes available on table:', ingotRecipes.length);

if (ingotRecipes.length === 0) {
  throw new Error('No recipe for gold_ingot found on crafting table!');
}

const numIngotsToCraft = Math.floor(lib.count('gold_nugget') / 9);
console.log(`Crafting ${numIngotsToCraft} gold ingots on crafting table...`);
await bot.craft(ingotRecipes[0], numIngotsToCraft, tableBlock);
console.log(`Crafted! Current gold ingots: ${lib.count('gold_ingot')}, nuggets left: ${lib.count('gold_nugget')}`);

// Step 2: Craft golden_boots using crafting table
const bootsRecipes = bot.recipesFor(mcData.itemsByName.golden_boots.id, null, 1, tableBlock);
console.log('Golden boots recipes available on table:', bootsRecipes.length);

if (bootsRecipes.length === 0) {
  throw new Error('No recipe for golden_boots found on crafting table!');
}

console.log('Crafting golden_boots on crafting table...');
await bot.craft(bootsRecipes[0], 1, tableBlock);
console.log('Crafted golden_boots successfully!');

// Step 3: Equip golden_boots
const bootsItem = bot.inventory.items().find(i => i.name === 'golden_boots');
if (!bootsItem) {
  throw new Error('golden_boots not found in inventory after craft!');
}

console.log('Equipping golden_boots into feet slot...');
await bot.equip(bootsItem, 'feet');
console.log('Equipped! Feet armor slot (slot 8):', bot.inventory.slots[8]?.name);

bot.chat('Beta: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% PIGLIN NEUTRALITY ACTIVE!');

// Step 4: Scan for all chests in base to check for spare iron armor or weapons
const chests = bot.findBlocks({
  matching: b => b && b.name.includes('chest'),
  maxDistance: 12,
  count: 10
});
console.log(`Found ${chests.length} chests near base:`, chests.map(p => lib.fmt(p)).join(', '));

// Equip best available weapon & shield
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('=== Final Status ===');
console.log('Position:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Armor worn:', {
  head: bot.inventory.slots[5]?.name,
  chest: bot.inventory.slots[6]?.name,
  legs: bot.inventory.slots[7]?.name,
  feet: bot.inventory.slots[8]?.name,
  offhand: bot.inventory.slots[45]?.name
});
console.log('Inventory:', lib.inv());

return {
  golden_boots_equipped: bot.inventory.slots[8]?.name === 'golden_boots',
  armor: {
    head: bot.inventory.slots[5]?.name,
    chest: bot.inventory.slots[6]?.name,
    legs: bot.inventory.slots[7]?.name,
    feet: bot.inventory.slots[8]?.name,
    offhand: bot.inventory.slots[45]?.name
  },
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget'),
  hp: bot.health,
  food: bot.food
};
