// programs/386-pickup-ascend-craft-sword.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'food:', bot.food);

// 1. Pickup all dropped cobblestone at our feet
console.log('Picking up cobblestone drops...');
try {
  const p = await lib.pickup(6);
  console.log(`Picked up ${p} items.`);
} catch (e) {
  console.log('Pickup error:', e.message);
}

console.log('Cobblestone count:', lib.count('cobblestone'));

// 2. Ascend back to base shelter (294, 72, -56)
console.log('Ascending back to base shelter...');
try {
  await lib.goTo(294, 72, -56, 1.5, { dig: true, timeoutMs: 15000 });
} catch (e) {
  console.log('Ascent note:', e.message);
  // Fallback: walk along shaft towards (301, 71, -44)
  await lib.goTo(301, 71, -44, 1.5, { dig: true, timeoutMs: 10000 });
  await lib.goTo(294, 72, -56, 1.5, { dig: true, timeoutMs: 10000 });
}

console.log('Arrived at base! Pos:', lib.fmt(bot.entity.position));

// 3. Ensure sticks
if (lib.count('stick') < 1) {
  if (lib.count('*_planks') < 2) {
    const log = bot.inventory.items().find(i => i.name.endsWith('_log'));
    if (log) await lib.craft(log.name.replace('_log', '_planks'), 4);
  }
  await lib.craft('stick', 4);
}

// 4. Craft stone sword
if (lib.count('cobblestone') >= 2) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('SUCCESS: Stone sword crafted!');
  } catch (e) {
    console.log(`Craft stone_sword error: ${e.message}`);
  }
}

// Equip stone sword
try {
  await lib.equipWeapon();
  console.log('Equipped weapon:', bot.heldItem?.name);
} catch (e) {}

console.log('Current gear and inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
