// programs/381-craft-stone-gear.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Collect cobblestone
console.log('Collecting 12 cobblestone with lib.collect...');
try {
  const mined = await lib.collect('cobblestone', 12);
  console.log('Collected cobblestone:', JSON.stringify(mined));
} catch (e) {
  console.log('Collect cobblestone error:', e.message);
}

// 2. Craft sticks if needed
if (lib.count('stick') < 2) {
  if (lib.count('*_planks') < 2 && lib.count('*_log') > 0) {
    const log = bot.inventory.items().find(i => i.name.endsWith('_log'));
    await lib.craft(log.name.replace('_log', '_planks'), 4);
  }
  await lib.craft('stick', 4);
}

// 3. Craft stone sword
console.log('Crafting stone sword...');
try {
  await lib.craft('stone_sword', 1);
  console.log('Crafted stone_sword!');
} catch (e) {
  console.log('Craft sword error:', e.message);
}

// Equip stone sword
try {
  await lib.equipWeapon();
  console.log('Equipped weapon:', bot.heldItem?.name);
} catch (e) {
  console.log('Equip weapon error:', e.message);
}

console.log('Current inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
