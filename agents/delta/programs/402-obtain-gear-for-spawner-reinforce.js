// programs/402-obtain-gear-for-spawner-reinforce.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Obtain stone sword
console.log('Obtaining stone_sword...');
try {
  const swordRes = await lib.obtain('stone_sword', 1);
  console.log('Obtain sword:', JSON.stringify(swordRes));
} catch (e) {
  console.log('Obtain sword note:', e.message);
}

// 2. Obtain 16 cobblestone
console.log('Obtaining 16 cobblestone...');
try {
  const cobbleRes = await lib.obtain('cobblestone', 16);
  console.log('Obtain cobble:', JSON.stringify(cobbleRes));
} catch (e) {
  console.log('Obtain cobble note:', e.message);
}

try { await lib.equipWeapon(); } catch (e) {}

console.log('Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
