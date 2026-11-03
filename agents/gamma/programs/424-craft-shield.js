// programs/424-craft-shield.js
console.log('=== OBTAIN SHIELD & EQUIP OFFHAND (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Check if we already have a shield in inventory
if (lib.count('shield') === 0 && bot.inventory.slots[45]?.name !== 'shield') {
  console.log('Obtaining shield via lib.obtain("shield", 1)...');
  bot.chat('gamma: Gathering materials to craft a shield for 100% fireball immunity!');
  try {
    await lib.obtain('shield', 1);
  } catch (e) {
    console.log('lib.obtain shield error:', e.message);
  }
}

// 2. Equip shield in offhand
if (bot.inventory.slots[45]?.name !== 'shield') {
  const s = bot.inventory.items().find(i => i.name === 'shield');
  if (s) {
    await bot.equip(s, 'off-hand');
    console.log('Equipped shield in off-hand (slot 45)!');
    bot.chat('gamma: Shield equipped in offhand! 100% fireball defense active!');
  } else {
    try { await lib.equipArmor(); } catch (e) {}
  }
}

console.log('Final Inv:', JSON.stringify(lib.inv()));
console.log('Offhand item:', bot.inventory.slots[45]?.name);
console.log('Held item:', bot.heldItem?.name);

return {
  hasShield: lib.count('shield') > 0 || bot.inventory.slots[45]?.name === 'shield',
  offhand: bot.inventory.slots[45]?.name,
  inv: lib.inv()
};
