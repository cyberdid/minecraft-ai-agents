// programs/407-obtain-weapons-and-cobble.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Obtain stone sword
console.log('Obtaining stone_sword...');
try {
  const swordRes = await lib.obtain('stone_sword', 1);
  console.log('Obtained sword:', JSON.stringify(swordRes));
} catch (e) {
  console.log('Obtain sword error:', e.message);
}

// 2. Obtain 24 cobblestone for blast shielding
console.log('Obtaining 24 cobblestone...');
try {
  const cobbleRes = await lib.obtain('cobblestone', 24);
  console.log('Obtained cobble:', JSON.stringify(cobbleRes));
} catch (e) {
  console.log('Obtain cobble error:', e.message);
}

// 3. Equip weapon
try {
  await lib.equipWeapon();
  console.log('Equipped weapon:', bot.heldItem?.name);
} catch (e) {}

console.log('Final inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

bot.chat(`delta: Armed with stone_sword & ${lib.count('cobblestone')} cobble! Ready to fortify Spawner Bridge and harvest rods!`);
