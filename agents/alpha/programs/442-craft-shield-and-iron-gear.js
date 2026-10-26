// programs/442-craft-shield-and-iron-gear.js
console.log('=== Program 442: Obtain Shield & Weapons for Blaze Combat ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Sprint East to base door (294, 72, -54)
console.log('Moving to base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 20000 });
} catch (e) {
  try { await lib.goToXZ(294, -54); } catch (e2) {}
}

console.log('Entering base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(294, 72, -55, 1); } catch (e2) {}
}

// 2. Set spawn at Bed 1
try { await lib.setSpawn(); } catch (e) {}

// 3. Check base chest for iron or shield
let chest = {};
try {
  chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(chest));
  const toWithdraw = {};
  for (const item of ['shield', 'iron_ingot', 'raw_iron', 'cobblestone', 'iron_sword', 'stone_sword', 'bread', 'coal']) {
    if (chest[item] > 0) toWithdraw[item] = chest[item];
  }
  if (Object.keys(toWithdraw).length > 0) await lib.withdraw(toWithdraw, 293, 72, -57);
} catch (e) {}

console.log('Inventory after chest check:', JSON.stringify(lib.inv()));

// 4. Obtain shield if not already held
if (lib.count('shield') === 0) {
  console.log('Obtaining shield via lib.obtain...');
  try {
    const res = await lib.obtain('shield', 1);
    console.log('Shield obtain steps:', res.steps ? res.steps.join(' -> ') : 'done');
  } catch (err) {
    console.log('Shield obtain note:', err.message);
  }
}

// 5. Obtain stone or iron sword
if (lib.count('*_sword') === 0) {
  try {
    await lib.obtain('stone_sword', 1);
  } catch (e) {}
}

// 6. Gather 16 cobblestone
if (lib.count('cobblestone') < 16) {
  try {
    await lib.collect('cobblestone', 16);
  } catch (e) {}
}

// 7. Equip shield and weapon
await lib.equipArmor();
await lib.equipWeapon();

console.log('Alpha gear equipped:', JSON.stringify(lib.inv()));
console.log('Tools/durability:', JSON.stringify(lib.tools()));
console.log('Alpha status:', JSON.stringify(lib.status()));

const hasShield = lib.count('shield') > 0 || bot.inventory.slots[45]?.name === 'shield';
bot.chat(`team: Alpha shield & weapon outfitting complete! Shield=${hasShield}, Sword=${lib.count('*_sword') > 0}, Cobble=${lib.count('cobblestone')}. Ready for Blaze Spawner assault!`);
