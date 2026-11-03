// programs/628-obtain-shield-and-rearm.js
console.log('=== Program 628: Set Spawn, Obtain Shield & Food ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food, 'Time info:', lib.time());

// 1. Move into base and set spawn at Bed 1 (294, 72, -55)
console.log('Moving into base...');
try {
  await lib.goTo(293, 72, -55, 1, { timeoutMs: 12000 });
} catch (e) {
  console.log('Go to base note:', e.message);
}

try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
  bot.chat('alpha: Spawn locked at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 2. Obtain Shield (mandatory for 100% Blaze fireball immunity)
console.log('Obtaining Shield (1 iron + 6 planks)...');
try {
  const r = await lib.obtain('shield', 1);
  console.log('Obtain shield result:', r);
} catch (err) {
  console.log('lib.obtain shield error:', err.message);
}

// 3. Obtain Sword if needed
if (lib.count('*_sword') === 0) {
  console.log('Obtaining stone_sword...');
  try {
    await lib.obtain('stone_sword', 1);
  } catch (e) {
    console.log('Sword error:', e.message);
  }
}

// 4. Obtain Food if needed (4+ cooked meat)
if (lib.count('cooked_*') < 4) {
  console.log('Obtaining 4 cooked beef/porkchop/mutton...');
  try {
    await lib.obtain('cooked_beef', 4);
  } catch (e) {
    console.log('Food obtain error:', e.message);
  }
}

// 5. Equip Shield in Offhand and Sword in Mainhand
await lib.equipArmor();
await lib.equipWeapon();

console.log('=== REARM COMPLETE ===');
console.log('Inventory:', lib.inv());
console.log('Held weapon:', bot.heldItem?.name, 'Offhand:', bot.inventory.slots[45]?.name);
bot.chat(`alpha: Rearmed! Weapon: ${bot.heldItem?.name || 'none'}, Offhand: ${bot.inventory.slots[45]?.name || 'none'}, Food: ${lib.count('cooked_*')}`);
