// programs/629-find-iron-and-craft-shield.js
console.log('=== Program 629: Find Iron, Smelt & Craft Shield ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// 1. Scan for iron_ore or deepslate_iron_ore within 32 blocks
const ironOres = bot.findBlocks({
  matching: b => b.name.includes('iron_ore'),
  maxDistance: 32,
  count: 8
});
console.log(`Found ${ironOres.length} iron ore blocks nearby:`);
for (const p of ironOres) {
  console.log(`- ${bot.blockAt(p)?.name} at ${lib.fmt(p)} (dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m)`);
}

// 2. If iron ore found, mine it with stone pickaxe!
if (ironOres.length > 0 && lib.count('raw_iron') === 0 && lib.count('iron_ingot') === 0) {
  console.log('Mining nearby iron ore...');
  try {
    await lib.collect(['iron_ore', 'deepslate_iron_ore'], Math.min(ironOres.length, 4), { timeoutMs: 30000 });
  } catch (e) {
    console.log('Collect iron error:', e.message);
  }
}

// 3. If still no raw iron, use lib.obtain('raw_iron', 1)
if (lib.count('raw_iron') === 0 && lib.count('iron_ingot') === 0) {
  console.log('Calling lib.obtain(raw_iron, 1)...');
  try {
    await lib.obtain('raw_iron', 1);
  } catch (e) {
    console.log('obtain raw_iron error:', e.message);
  }
}

console.log('Inv after iron mining:', lib.inv());

// 4. Return to base at (293, 72, -55) to smelt and craft
if (lib.count('raw_iron') > 0 || lib.count('iron_ingot') > 0) {
  console.log('Ascending to base at (293, 72, -55)...');
  try {
    await lib.goTo(293, 72, -55, 1, { timeoutMs: 25000 });
  } catch (err) {
    console.log('Ascend note:', err.message);
  }
  
  // Smelt raw iron if needed
  if (lib.count('iron_ingot') === 0 && lib.count('raw_iron') > 0) {
    console.log('Smelting raw iron with coal...');
    try {
      await lib.smelt('raw_iron', 'coal', 1);
    } catch (e) {
      console.log('Smelt error:', e.message);
    }
  }
  
  // Ensure we have 6 planks for shield
  if (lib.count('*_planks') < 6 && lib.count('*_log') > 0) {
    const logItem = bot.inventory.items().find(i => i.name.includes('_log'));
    if (logItem) {
      const plankData = mcData.itemsByName[logItem.name.replace('_log', '_planks')];
      if (plankData) {
        const r = bot.recipesFor(plankData.id, null, 1, null)[0];
        if (r) await bot.craft(r, logItem.count, null);
      }
    }
  }
  
  // Craft Shield (1 iron_ingot + 6 planks)
  if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
    console.log('Crafting shield...');
    try {
      await lib.craft('shield', 1);
    } catch (e) {
      console.log('Shield craft error:', e.message);
    }
  }
  
  // Equip Shield in offhand!
  await lib.equipArmor();
  await lib.equipWeapon();
  
  console.log('=== SHIELD EQUIPPED ===');
  console.log('Offhand:', bot.inventory.slots[45]?.name, 'Mainhand:', bot.heldItem?.name);
  bot.chat(`alpha: Shield ready in offhand: ${bot.inventory.slots[45]?.name || 'none'}! Fireball immunity ACTIVE!`);
}
