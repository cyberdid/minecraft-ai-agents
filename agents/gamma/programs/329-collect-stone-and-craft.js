// programs/329-collect-stone-and-craft.js
console.log('=== COLLECT STONE & CRAFT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Mine 3 stone to get stone pickaxe
console.log('Collecting initial 3 stone...');
try {
  await lib.collect('stone', 3);
} catch (e) {
  console.log('Initial stone collect note:', e.message);
}
console.log('Cobblestone in inv:', lib.count('cobblestone'));

// 2. Craft stone pickaxe
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  console.log('Crafting stone_pickaxe...');
  await lib.craft('stone_pickaxe', 1);
}

// 3. Collect 30 more stone (stone pickaxe equips automatically in lib.collect!)
console.log('Collecting 30 cobblestone with stone pickaxe...');
try {
  await lib.collect('stone', 30);
} catch (e) {
  console.log('Stone collect note:', e.message);
}
console.log('Cobblestone count now:', lib.count('cobblestone'));

// 4. Craft stone sword
if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
  console.log('Crafting stone_sword...');
  if (lib.count('stick') < 1) await lib.craft('stick', 4);
  await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
}

console.log('\n=== STATUS AT END ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma geared up: stone_sword, stone_pickaxe, cobble x${lib.count('cobblestone')}. Ready for Nether transit!`);
