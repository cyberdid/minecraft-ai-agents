// programs/442-surface-wood-and-shield.js
globalThis.isCancelled = isCancelled;

console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Walk up staircase from y=52 to surface entrance at (302, 71, -44)
console.log('Ascending mine staircase to surface entrance (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 1.5, { timeoutMs: 30000 });
  console.log('Reached mine entrance! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Mine entrance goto error:', e.message);
  try { await lib.goToXZ(302, -44, { timeoutMs: 20000 }); } catch (e2) {}
}

// 2. Walk into base shelter at (293, 72, -56)
console.log('Walking to base at (293, 72, -56)...');
try {
  await lib.goTo(293, 72, -56, 1.5, { timeoutMs: 20000 });
  console.log('Reached base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {}

// 3. Now on surface, collect 2 logs for shield planks
if (lib.count('*_planks') < 6) {
  console.log('Collecting logs on surface...');
  try {
    await lib.collect('*_log', 2);
    console.log('Logs collected! Count:', lib.count('*_log'));
    await lib.craft('oak_planks', 8);
    console.log('Planks count:', lib.count('*_planks'));
  } catch (e) {
    console.log('Log collect error:', e.message);
    // If oak fails, try birch
    try {
      await lib.collect('birch_log', 2);
      await lib.craft('birch_planks', 8);
    } catch (e2) {}
  }
}

// 4. Craft shield at base crafting table (295, 72, -56)
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
    console.log('Shield crafted successfully!');
  } catch (e) {
    console.log('Craft shield note:', e.message);
  }
}

// 5. Equip shield in offhand
try {
  await lib.equipArmor();
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) {
    await bot.equip(shield, 'off-hand');
    console.log('Shield equipped in offhand!');
  }
} catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const offhand = bot.inventory.slots[45];
console.log('Offhand slot 45:', offhand?.name, 'Held:', bot.heldItem?.name);

if (offhand?.name === 'shield') {
  bot.chat('delta: Shield equipped in offhand! 100% fireball defense ready for Pillbox assault!');
}

console.log('Delta inventory:');
for (const item of bot.inventory.items()) console.log(`  ${item.name} x${item.count}`);
