// programs/441-smelt-iron-and-craft-shield.js
globalThis.isCancelled = isCancelled;

console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Walk back up to surface base at (293, 72, -56)
console.log('Walking up to base (293, 72, -56)...');
try {
  await lib.goTo(293, 72, -56, 1.5, { timeoutMs: 35000 });
  console.log('Arrived at base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goTo base note:', e.message);
  try { await lib.goToXZ(293, -56, { timeoutMs: 25000 }); } catch (e2) {}
}

// 2. Smelt raw_iron into iron_ingot
if (lib.count('iron_ingot') === 0 && lib.count('raw_iron') > 0) {
  console.log('Smelting raw_iron in base furnace...');
  try {
    const smeltRes = await lib.smelt('raw_iron', 'coal', 1);
    console.log('Smelt result:', JSON.stringify(smeltRes));
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

// 3. Ensure 6+ planks for shield (need 1-2 oak logs)
if (lib.count('*_planks') < 6) {
  console.log('Gathering wood for shield planks...');
  try {
    await lib.collect('*_log', 2);
    await lib.craft('oak_planks', 8);
    console.log('Planks crafted:', lib.count('*_planks'));
  } catch (e) {
    console.log('Planks note:', e.message);
  }
}

// 4. Craft shield
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
    console.log('Shield crafted successfully!');
  } catch (e) {
    console.log('Craft shield note:', e.message);
  }
}

// 5. Equip shield in offhand and sword in main hand
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
console.log('Offhand:', offhand?.name, 'Held:', bot.heldItem?.name);

if (offhand?.name === 'shield') {
  bot.chat('delta: Shield equipped in offhand! 100% fireball defense ready for Spawner assault!');
}

console.log('Delta inventory:');
for (const item of bot.inventory.items()) console.log(`  ${item.name} x${item.count}`);
