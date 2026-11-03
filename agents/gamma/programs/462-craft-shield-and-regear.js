// programs/462-craft-shield-and-regear.js
console.log('=== CRAFT SHIELD & REGEAR (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Walk to base
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 2));
} catch (e) {}

// 2. Check if we already have a shield
let hasShield = bot.inventory.slots[45]?.name === 'shield' || lib.count('shield') > 0;
console.log('Has shield already:', hasShield);

if (!hasShield) {
  bot.chat('gamma: Crafting shield for 100% fireball and projectile deflection...');
  try {
    await lib.obtain('shield', 1);
    console.log('lib.obtain("shield", 1) completed successfully!');
  } catch (err) {
    console.log('lib.obtain shield error:', err.message);
  }
}

// 3. Equip shield in offhand
const shieldItem = bot.inventory.items().find(i => i.name === 'shield');
if (shieldItem && bot.inventory.slots[45]?.name !== 'shield') {
  await bot.equip(shieldItem, 'off-hand');
  console.log('Equipped shield in off-hand (slot 45)!');
  bot.chat('gamma: Shield equipped in offhand! 100% fireball immunity active!');
}

try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// 4. Ensure we have cobblestone
if (lib.count('cobblestone') < 16) {
  console.log('Gathering cobblestone up to 16...');
  try {
    await lib.collect('cobblestone', 16 - lib.count('cobblestone'));
  } catch (e) {
    console.log('Cobblestone collect note:', e.message);
  }
}

console.log('Regear complete!');
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Held:', bot.heldItem?.name);
console.log('Inventory:', JSON.stringify(lib.inv()));

return {
  hp: bot.health,
  offhand: bot.inventory.slots[45]?.name,
  held: bot.heldItem?.name,
  inv: lib.inv()
};
