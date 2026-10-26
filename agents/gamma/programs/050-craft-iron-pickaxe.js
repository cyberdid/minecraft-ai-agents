// programs/050-craft-iron-pickaxe.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Craft sticks
await lib.ensureTable();
if (lib.count('stick') < 2) {
  console.log('Crafting sticks...');
  await lib.craft('stick', 4);
}

// 2. Craft iron_pickaxe
console.log('Crafting iron_pickaxe from 3 iron_ingots and 2 sticks...');
await lib.craft('iron_pickaxe', 1);
console.log('Iron pickaxe crafted! Total in inv:', lib.count('iron_pickaxe'));

// 3. Equip best tools & armor
await lib.equipArmor();

console.log('Gear now:', JSON.stringify(lib.tools()));
console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`gamma crafted IRON PICKAXE! Gear: ${JSON.stringify(lib.tools())}. Milestone 2 reached for Gamma!`);
