// programs/643-craft-shield-and-arm.js
console.log('=== Program 643: Obtain Shield & Equip Defense ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Check if we already have iron or shield
console.log('Shield recipe:', lib.recipe('shield'));
console.log('Current inv:', lib.inv());

// Obtain 1 shield
console.log('Obtaining shield...');
try {
  const result = await lib.obtain('shield', 1);
  console.log('Obtain shield result:', result);
} catch (err) {
  console.log('lib.obtain shield error:', err.message);
}

// Equip armor and shield
try {
  await lib.equipArmor();
} catch (e) {
  console.log('equipArmor note:', e.message);
}

// Equip weapon
try {
  await lib.equipWeapon();
} catch (e) {
  console.log('equipWeapon note:', e.message);
}

// Inspect offhand and equipped items
const offhand = bot.inventory.slots[45];
console.log('Offhand item (slot 45):', offhand?.name);
console.log('Held weapon:', bot.heldItem?.name);
console.log('Current inv:', lib.inv());
console.log('=== Program 643 Complete ===');
