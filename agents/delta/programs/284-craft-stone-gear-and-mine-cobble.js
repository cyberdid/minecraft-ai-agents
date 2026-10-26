// programs/284-craft-stone-gear-and-mine-cobble.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// 1. Craft stone_pickaxe and stone_sword
console.log('Crafting stone_pickaxe...');
await lib.craft('stone_pickaxe', 1);
console.log('Crafting stone_sword...');
await lib.craft('stone_sword', 1);

console.log('Tools crafted! Now mining 32 cobblestone with stone pickaxe...');
await lib.collect('cobblestone', 32);
console.log('Cobblestone collected! Count:', lib.count('cobblestone'));

// Equip stone_sword
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');

// Print inventory
console.log('Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
