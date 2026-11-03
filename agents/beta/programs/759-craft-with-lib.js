// programs/759-craft-with-lib.js
console.log('=== Program 759: Craft with lib & Equip Golden Boots ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);
console.log('Nuggets:', lib.count('gold_nugget'), 'Ingots:', lib.count('gold_ingot'));

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure bot is fully settled after spawn
await sleep(1000);

// Clear any stuck cursor or crafting grid items
try { await lib.stowCursor(); } catch (e) {}
try { await lib.clearCraftingGrid(); } catch (e) {}

// Check block at (295, 72, -56)
const blk = bot.blockAt(new Vec3(295, 72, -56));
console.log('Block at (295, 72, -56):', blk?.name);

// Step 1: Craft 4 gold ingots using lib.craft
console.log('Crafting gold ingots with lib.craft...');
try {
  await lib.craft('gold_ingot', 4);
  console.log('Successfully crafted gold_ingot! Current ingots:', lib.count('gold_ingot'));
} catch (err) {
  console.log('lib.craft gold_ingot error:', err.message);
}

// Step 2: Craft golden_boots using lib.craft
if (lib.count('gold_ingot') >= 4) {
  console.log('Crafting golden_boots with lib.craft...');
  try {
    await lib.craft('golden_boots', 1);
    console.log('Successfully crafted golden_boots! Count:', lib.count('golden_boots'));
  } catch (err) {
    console.log('lib.craft golden_boots error:', err.message);
  }
}

// Step 3: Equip golden_boots
const boots = bot.inventory.items().find(i => i.name === 'golden_boots');
if (boots) {
  console.log('Equipping golden_boots in feet armor slot...');
  await bot.equip(boots, 'feet');
  console.log('Feet slot (slot 8):', bot.inventory.slots[8]?.name);
  bot.chat('Beta: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% PIGLIN NEUTRALITY ACTIVE!');
}

// Check armor & weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('=== Final Status ===');
console.log('Armor:', {
  head: bot.inventory.slots[5]?.name,
  chest: bot.inventory.slots[6]?.name,
  legs: bot.inventory.slots[7]?.name,
  feet: bot.inventory.slots[8]?.name,
  offhand: bot.inventory.slots[45]?.name
});
console.log('Ingots on Beta:', lib.count('gold_ingot'));
console.log('Nuggets on Beta:', lib.count('gold_nugget'));
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
