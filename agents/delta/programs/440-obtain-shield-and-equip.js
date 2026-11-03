// programs/440-obtain-shield-and-equip.js
globalThis.isCancelled = isCancelled;

console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Obtain shield (1 iron ingot + 6 planks)
if (lib.count('shield') === 0) {
  console.log('Obtaining shield via lib.obtain...');
  bot.chat('delta: Crafting shield for 100% fireball immunity before joining Pillbox assault...');
  try {
    const res = await lib.obtain('shield', 1);
    console.log('lib.obtain shield result:', JSON.stringify(res));
  } catch (e) {
    console.log('lib.obtain shield error:', e.message);
  }
}

// 2. Equip shield in offhand
try {
  await lib.equipArmor();
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) {
    await bot.equip(shield, 'off-hand');
    console.log('Shield equipped in offhand!');
  }
} catch (e) {
  console.log('Equip shield error:', e.message);
}

// 3. Equip weapon in main hand
try { await lib.equipWeapon(); } catch (e) {}

const offhand = bot.inventory.slots[45];
console.log('Offhand slot 45:', offhand?.name, 'Held:', bot.heldItem?.name);

if (offhand?.name === 'shield') {
  bot.chat('delta: Shield equipped in off-hand! Ready for zero-damage Blaze combat.');
}

console.log('Delta inventory:');
for (const item of bot.inventory.items()) console.log(`  ${item.name} x${item.count}`);
