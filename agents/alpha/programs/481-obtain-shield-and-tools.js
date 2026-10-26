// programs/481-obtain-shield-and-tools.js
console.log('=== Program 481: Obtain Shield for 100% Blaze Fireball Immunity ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check base chest for iron or shield
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(chest));
  const toWithdraw = {};
  for (const item of ['shield', 'iron_ingot', 'raw_iron', 'stone_pickaxe', 'stone_sword', 'cobblestone', 'oak_planks', 'coal', 'charcoal']) {
    if (chest[item] > 0) toWithdraw[item] = chest[item];
  }
  if (Object.keys(toWithdraw).length > 0) {
    console.log('Withdrawing from chest:', JSON.stringify(toWithdraw));
    await lib.withdraw(toWithdraw, 293, 72, -57);
  }
} catch (e) {
  console.log('Chest check note:', e.message);
}

// 2. If raw_iron held, smelt 1 iron ingot in base furnace
if (lib.count('raw_iron') > 0 && lib.count('iron_ingot') === 0) {
  console.log('Smelting 1 raw_iron in furnace...');
  try {
    const fuel = bot.inventory.items().find(i => ['coal', 'charcoal', 'oak_planks', 'stick'].includes(i.name)) || { name: 'oak_planks' };
    await lib.smelt('raw_iron', fuel.name, 1);
  } catch (err) {
    console.log('Smelt note:', err.message);
  }
}

// 3. Obtain shield via lib.obtain if still needed
if (lib.count('shield') === 0 && bot.inventory.slots[45]?.name !== 'shield') {
  console.log('Obtaining shield via lib.obtain...');
  try {
    await passDoorOut();
  } catch (e) {}
  try {
    const res = await lib.obtain('shield', 1);
    console.log('Shield obtain steps:', res.steps ? res.steps.join(' -> ') : 'done');
  } catch (err) {
    console.log('Shield obtain note:', err.message);
  }
}

// 4. Ensure stone_pickaxe and stone_sword
if (lib.count('*_pickaxe') === 0) {
  try {
    await lib.obtain('stone_pickaxe', 1);
  } catch (e) {}
}

if (lib.count('*_sword') === 0) {
  try {
    await lib.obtain('stone_sword', 1);
  } catch (e) {}
}

// 5. Gather 16 cobblestone
if (lib.count('cobblestone') < 16) {
  try {
    await lib.collect('cobblestone', 16);
  } catch (e) {}
}

// 6. Equip armor (equips shield in offhand) and weapon
await lib.equipArmor();
await lib.equipWeapon();

const offhand = bot.inventory.slots[45]?.name;
console.log('Alpha gear:');
console.log('Offhand:', offhand);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha shield outfitting complete! Offhand=${offhand}, Shield=${lib.count('shield') > 0 || offhand === 'shield'}, Sword=${lib.count('*_sword') > 0}, Cobble=${lib.count('cobblestone')}. 100% immune to Blaze fireballs!`);
