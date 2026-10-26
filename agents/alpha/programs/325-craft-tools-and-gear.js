// programs/325-craft-tools-and-gear.js
console.log('=== Program 325: Craft Stone Tools & Prepare Sticks ===');

// 1. Enter base
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door note:', e.message);
}

// 2. Craft sticks
console.log('Crafting sticks...');
await lib.craft('stick', 4);
console.log('Sticks crafted! Inv:', JSON.stringify(lib.inv()));

// 3. Craft stone tools using base table at (295, 72, -56)
console.log('Crafting stone tools...');
await lib.craft('stone_pickaxe', 1);
await lib.craft('stone_sword', 1);
await lib.craft('stone_axe', 1);

console.log('Stone tools crafted! Inv:', JSON.stringify(lib.inv()));
await lib.equipWeapon();
console.log('Alpha gear:', JSON.stringify(lib.tools()));

// 4. Also craft an extra stone_pickaxe for Beta
try {
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted spare stone_pickaxe for Beta!');
} catch (e) {}

bot.chat('beta: Beta, I crafted a stone pickaxe for you! Meet me at shaft entrance or I can drop it down!');
