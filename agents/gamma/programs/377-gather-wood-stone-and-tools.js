// programs/377-gather-wood-stone-and-tools.js
console.log('=== GATHER WOOD, STONE, WEAPONS & SHIELD ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Harvest 4 logs
console.log('Harvesting 4 logs...');
try {
  await lib.collect('*_log', 4);
  console.log('Collected logs! Inv:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Log collect error:', e.message);
}

// Step 2: Craft planks, sticks, wooden pickaxe
const logType = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
const plankType = logType ? logType.replace('_log', '_planks') : 'birch_planks';

if (lib.count('*_log') > 0) {
  await lib.craft(plankType, 16);
  await lib.craft('stick', 8);
  if (lib.count('wooden_pickaxe') === 0) {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Crafted wooden_pickaxe!');
  }
}

// Step 3: Quarry cobblestone at (304, 68, -52)
console.log('Navigating to quarry floor at (304, 68, -52)...');
try {
  await lib.goTo(304, 68, -52, 2, { dig: true, timeoutMs: 12000 });
  const cobbleNeeded = Math.max(0, 24 - lib.count('cobblestone'));
  if (cobbleNeeded > 0) {
    await lib.collect('stone', cobbleNeeded);
    console.log(`Mined cobblestone! Total: ${lib.count('cobblestone')}`);
  }
} catch (e) {
  console.log('Quarry error:', e.message);
}

// Step 4: Craft stone tools
if (lib.count('cobblestone') >= 7) {
  if (lib.count('stone_pickaxe') === 0) await lib.craft('stone_pickaxe', 1);
  if (lib.count('stone_sword') < 2) await lib.craft('stone_sword', 2);
  if (lib.count('furnace') === 0 && lib.count('cobblestone') >= 8) await lib.craft('furnace', 1);
  console.log('Crafted stone tools & furnace!');
}

// Step 5: Check for exposed iron ore on hill
const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 16, count: 3 });
console.log('Nearby iron ores:', ironOres.map(o => `${o.name} at ${lib.fmt(o.position)}`).join(', ') || 'none');
if (ironOres.length > 0 && ironOres[0].position.y >= 60) {
  try {
    await lib.dig(ironOres[0].position.x, ironOres[0].position.y, ironOres[0].position.z);
    await lib.pickup(4);
    if (lib.count('raw_iron') > 0) {
      console.log('Smelting raw iron for shield...');
      await lib.smelt('raw_iron', plankType, 1);
      if (lib.count('iron_ingot') >= 1) {
        await lib.craft('shield', 1);
        console.log('SHIELD CRAFTED!');
      }
    }
  } catch (e) {
    console.log('Iron mining/smelting note:', e.message);
  }
}

// Step 6: Equip gear
try {
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Equipped gear! Tools:', JSON.stringify(lib.tools()), 'Offhand:', bot.inventory.slots[45]?.name);
} catch (e) {}

// Step 7: Return to base
try {
  await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 8000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
