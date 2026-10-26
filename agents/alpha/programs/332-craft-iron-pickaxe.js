// programs/332-craft-iron-pickaxe.js
console.log('=== Program 332: Craft Iron Pickaxe ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Craft planks from birch_log
await lib.craft('birch_planks', 4);
await lib.craft('stick', 4);
console.log('Sticks ready! Inv:', JSON.stringify(lib.inv()));

// 2. Craft iron_pickaxe (needs 3 iron_ingot + 2 sticks)
await lib.craft('iron_pickaxe', 1);
console.log('Crafted iron_pickaxe! Gear:', JSON.stringify(lib.tools()));

// 3. Equip best gear
await lib.equipArmor();
await lib.equipWeapon();

console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha equipped with iron_chestplate, iron_sword, and iron_pickaxe! Ready for Nether expedition!`);
