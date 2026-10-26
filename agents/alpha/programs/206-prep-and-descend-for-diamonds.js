// programs/206-prep-and-descend-for-diamonds.js
console.log('--- Prepare and Descend for Diamonds (Milestone 6) ---');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Craft sticks if needed
if (lib.count('stick') < 8) {
  if (lib.count('*_planks') < 2 && lib.count('*_log') > 0) {
    const log = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
    await lib.craft(log.replace('_log', '_planks'), 4);
  }
  const plank = Object.keys(lib.inv()).find(k => k.endsWith('_planks')) || 'birch_planks';
  await lib.craft('stick', 8);
}

// 2. Craft 16 torches (4 coal + 4 sticks)
if (lib.count('torch') < 12 && lib.count('coal') >= 3 && lib.count('stick') >= 3) {
  console.log('Crafting torches...');
  try {
    await lib.craft('torch', 16);
    console.log(`Crafted torches! Torch count: ${lib.count('torch')}`);
  } catch (e) {
    console.log('Craft torch error:', e.message);
  }
}

// 3. Craft 2 spare stone pickaxes
const pickaxes = Object.keys(lib.inv()).filter(k => k.endsWith('_pickaxe'));
let totalPickaxes = pickaxes.reduce((sum, k) => sum + lib.count(k), 0);
console.log(`Current pickaxes count: ${totalPickaxes} (${JSON.stringify(pickaxes)})`);

if (totalPickaxes < 3) {
  console.log('Crafting spare stone pickaxes...');
  try {
    const needed = 3 - totalPickaxes;
    for (let i = 0; i < needed; i++) {
      await lib.craft('stone_pickaxe', 1);
    }
    console.log('Spare stone pickaxes crafted!');
  } catch (e) {
    console.log('Craft stone pickaxe error:', e.message);
  }
}

// 4. Chat with Beta
bot.chat('beta: Geared with water bucket, 16 torches, stone & iron pickaxes. Heading to East hill (345, 65, -40) to descend for diamonds!');

// 5. Step outside door
console.log('Stepping outside...');
try {
  if (typeof passDoorOut === 'function') await passDoorOut();
  else await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door exit error:', e.message);
}

// 6. Navigate to dry surface hill at (345, 65, -40)
console.log('Traveling to East hill start spot (345, 65, -40)...');
try {
  await lib.goTo(345, 65, -40, 2, { timeoutMs: 30000 });
  console.log('Arrived at start spot! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Travel warning:', e.message);
  try { await lib.goToXZ(345, -40, { timeoutMs: 25000 }); } catch (e2) {}
}

const startSurfacePos = bot.entity.position.clone();
console.log('Starting staircase descent from:', lib.fmt(startSurfacePos));

// 7. Descend to diamond level (target y=-54)
try {
  console.log('Beginning lib.descend to y=-54...');
  await lib.descend(-54, { torchEvery: 8 });
  console.log('Descent reached target! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Descend stopped/note:', e.message, 'Pos:', lib.fmt(bot.entity.position));
}

// 8. Search for diamonds in vicinity
console.log('Scanning for diamonds at pos:', lib.fmt(bot.entity.position));
const diamondOres = lib.find(['diamond_ore', 'deepslate_diamond_ore'], { maxDistance: 32, count: 10 });
console.log(`Found ${diamondOres.length} diamond ores!`);

if (diamondOres.length > 0) {
  for (const d of diamondOres) {
    if (isCancelled() || lib.count('diamond') >= 3) break;
    console.log(`Mining diamond at ${lib.fmt(d.position)}...`);
    try {
      // Must use iron pickaxe to mine diamond!
      const ironPick = mcData.itemsByName.iron_pickaxe?.id;
      if (ironPick) await bot.equip(ironPick, 'hand');
      await lib.goTo(d.position.x, d.position.y, d.position.z, 2, { dig: true, timeoutMs: 15000 });
      await lib.dig(d.position.x, d.position.y, d.position.z);
      await lib.pickup(4);
    } catch (err) {
      console.log('Mine diamond error:', err.message);
    }
  }
}

console.log(`Diamonds in inventory: ${lib.count('diamond')}`);

// 9. If we have 3 diamonds, craft diamond_pickaxe right here!
if (lib.count('diamond') >= 3 && lib.count('diamond_pickaxe') === 0) {
  console.log('Crafting diamond_pickaxe...');
  try {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('diamond_pickaxe', 1);
    console.log('*** MILESTONE 6 ACHIEVED: Diamond Pickaxe crafted! ***');
    bot.chat('beta: *** MILESTONE 6 ACHIEVED! Diamond pickaxe crafted! ***');
  } catch (e) {
    console.log('Craft diamond_pickaxe note:', e.message);
  }
}

// 10. Walk back up the staircase to surface
console.log('Ascending back up the stairs to surface...');
try {
  await lib.goTo(startSurfacePos.x, startSurfacePos.y, startSurfacePos.z, 3, { timeoutMs: 60000 });
  console.log('Returned to surface! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Ascent note:', e.message);
}

// 11. Return to base entrance
console.log('Returning to base entrance (294, 72, -52)...');
try {
  await lib.goTo(294, 72, -52, 1, { timeoutMs: 30000 });
  if (typeof passDoorIn === 'function') await passDoorIn();
  else await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base!');
} catch (e) {
  console.log('Base return note:', e.message);
}

console.log('Finished 206. Status:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Diamonds:', lib.count('diamond'), 'Diamond pickaxe:', lib.count('diamond_pickaxe'));
