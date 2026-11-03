// programs/391-obtain-weapons-and-cobble.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Obtain stone sword
console.log('Obtaining stone_sword...');
try {
  const swordResult = await lib.obtain('stone_sword', 1);
  console.log('Obtain stone_sword result:', JSON.stringify(swordResult));
} catch (e) {
  console.log('Obtain stone_sword note:', e.message);
}

// 2. Obtain cobblestone for building blast cover
if (lib.count('cobblestone') < 16) {
  console.log('Obtaining 16 cobblestone...');
  try {
    const cobbleResult = await lib.obtain('cobblestone', 16);
    console.log('Obtain cobblestone result:', JSON.stringify(cobbleResult));
  } catch (e) {
    console.log('Obtain cobblestone note:', e.message);
  }
}

// 3. Equip weapon
try {
  await lib.equipWeapon();
  console.log('Equipped weapon:', bot.heldItem?.name);
} catch (e) {}

console.log('Delta inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
