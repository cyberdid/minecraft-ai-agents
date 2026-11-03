// programs/649-craft-shield.js
console.log('=== Program 649: Craft & Equip Shield ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Check if we already have shield
if (lib.count('shield') === 0) {
  console.log('Obtaining shield via lib.obtain...');
  const res = await lib.obtain('shield', 1);
  console.log('Obtain shield result:', res);
}

// Equip shield in offhand and weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('Offhand (slot 45):', bot.inventory.slots[45]?.name);
console.log('Held item:', bot.heldItem?.name);
console.log('Final inv:', lib.inv());
console.log('=== Program 649 Complete ===');
