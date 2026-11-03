// programs/400-obtain-gear-and-scan-food.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Obtain stone sword
console.log('Obtaining stone_sword...');
try {
  await lib.obtain('stone_sword', 1);
  console.log('Stone sword obtained!');
} catch (e) {
  console.log('Obtain sword error:', e.message);
}

// 2. Obtain stone pickaxe
if (lib.count('*_pickaxe') === 0) {
  try {
    await lib.obtain('stone_pickaxe', 1);
    console.log('Stone pickaxe obtained!');
  } catch (e) {
    console.log('Obtain pickaxe error:', e.message);
  }
}

// 3. Mine 16 stone/cobblestone for building blast walls
console.log('Mining 16 stone for blast shielding...');
try {
  await lib.collect('stone', 16);
  console.log('Mined stone! Cobble count:', lib.count('cobblestone'));
} catch (e) {
  console.log('Collect stone error:', e.message);
}

// 4. Equip stone sword
try {
  await lib.equipWeapon();
  console.log('Equipped weapon:', bot.heldItem?.name);
} catch (e) {}

// 5. Scan animals within 80m
const animals = Object.values(bot.entities).filter(e => ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) && e.position.distanceTo(bot.entity.position) < 80);
console.log(`Animals within 80m (${animals.length}):`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)} dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
}

console.log('Delta inventory:');
for (const item of bot.inventory.items()) console.log(`  ${item.name} x${item.count}`);
