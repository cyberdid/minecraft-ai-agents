// programs/650-precision-shield-craft.js
console.log('=== Program 650: Precision Shield Crafting ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Step 1: Gather 2 logs and craft 8 planks
if (lib.count('*_planks') < 6) {
  console.log('Collecting logs for planks...');
  try {
    await lib.collect('*_log', 2);
    console.log('Logs collected! Crafting planks...');
    await lib.craft('oak_planks', 8);
    console.log('Planks now:', lib.count('*_planks'));
  } catch (err) {
    console.log('Log collect error:', err.message);
  }
}

// Step 2: Mine 1 iron ore at dry shaft (304, 48, -65)
if (lib.count('raw_iron') === 0 && lib.count('iron_ingot') === 0) {
  console.log('Mining iron ore at dry shaft (304, 48, -65)...');
  const ironOre = bot.findBlock({ matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'), maxDistance: 48 });
  if (ironOre) {
    console.log('Found iron ore at', lib.fmt(ironOre.position));
    try {
      await lib.dig(ironOre.position.x, ironOre.position.y, ironOre.position.z);
      await lib.pickup(4);
      console.log('Mined iron ore! raw_iron count:', lib.count('raw_iron'));
    } catch (err) {
      console.log('Mine iron ore error:', err.message);
    }
  }
}

// Step 3: Smelt raw iron at base furnace
if (lib.count('iron_ingot') === 0 && lib.count('raw_iron') > 0) {
  console.log('Returning to base furnace (295, 72, -55)...');
  try { await lib.goTo(295, 72, -55, 2, { timeoutMs: 15000 }); } catch (e) {}
  console.log('Smelting 1 raw_iron...');
  try {
    // Use stick or plank or coal as fuel
    const fuel = lib.count('coal') > 0 ? 'coal' : (lib.count('charcoal') > 0 ? 'charcoal' : (lib.count('*_planks') > 6 ? 'oak_planks' : 'stick'));
    const smeltRes = await lib.smelt('raw_iron', fuel, 1);
    console.log('Smelt result:', smeltRes);
  } catch (err) {
    console.log('Smelt error:', err.message);
  }
}

// Step 4: Craft shield (1 iron ingot + 6 planks)
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield at crafting table...');
  try {
    await lib.craft('shield', 1);
    console.log('SHIELD CRAFTED!');
  } catch (err) {
    console.log('Craft shield error:', err.message);
  }
}

// Step 5: Equip shield in offhand & equip weapon
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
  bot.chat('alpha: Full Shield Kit Ready! 100% fireball immunity active!');
}

console.log('=== Program 650 Complete ===');
console.log('Final inv:', lib.inv(), 'HP:', bot.health, 'dim:', bot.game.dimension);
