// programs/308-obtain-shield-and-cobble.js
console.log('=== OBTAIN SHIELD & COBBLESTONE ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv before:', JSON.stringify(lib.inv()));

// 1. Obtain 24 cobblestone
if (lib.count('cobblestone') < 24) {
  console.log('Obtaining 24 cobblestone...');
  try {
    await lib.obtain('cobblestone', 24);
    console.log('Cobblestone count now:', lib.count('cobblestone'));
  } catch (e) {
    console.log('Cobblestone obtain note:', e.message);
  }
}

// 2. Obtain shield
if (lib.count('shield') === 0) {
  console.log('Obtaining shield...');
  try {
    await lib.obtain('shield', 1);
    console.log('Shield obtained! Count:', lib.count('shield'));
  } catch (e) {
    console.log('Shield obtain note:', e.message);
  }
}

// 3. Equip armor and weapon
await lib.equipArmor();
await lib.equipWeapon();

console.log('\n=== STATUS AT END ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Tools/Gear:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma geared up: shield=${lib.count('shield')}, cobble=${lib.count('cobblestone')}, planks=${lib.count('*_planks')}. Ready for Nether transit!`);
