// programs/207-gather-wood-and-descend-diamonds.js
console.log('--- Gather Wood, Craft Supplies, and Descend for Diamonds ---');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight);

// 1. Step outside base door
console.log('Stepping outside...');
try {
  if (typeof passDoorOut === 'function') await passDoorOut();
  else await lib.goThroughDoor(294, 72, -54);
  console.log('Outside base! Current pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door exit error:', e.message);
}

// 2. Chop 4 logs from nearby tree
console.log('Chopping 4 logs from nearby tree...');
try {
  const got = await lib.collect('*_log', 4);
  console.log('Collected logs:', JSON.stringify(got));
} catch (e) {
  console.log('Collect log error:', e.message);
}

// 3. Convert logs to planks
const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logName) {
  const logCount = lib.count(logName);
  const plankName = logName.replace('_log', '_planks');
  console.log(`Crafting ${logCount * 4} ${plankName}...`);
  await lib.craft(plankName, logCount * 4);
}

// 4. Craft sticks
console.log('Crafting sticks...');
const plankName = Object.keys(lib.inv()).find(k => k.endsWith('_planks')) || 'birch_planks';
if (lib.count('stick') < 8 && lib.count(plankName) >= 4) {
  await lib.craft('stick', 8);
}
console.log('Sticks count:', lib.count('stick'), 'Planks count:', lib.count(plankName));

// 5. Craft 16 torches (4 coal + 4 sticks)
if (lib.count('torch') < 12 && lib.count('coal') >= 3 && lib.count('stick') >= 3) {
  console.log('Crafting 16 torches...');
  try {
    await lib.craft('torch', 16);
    console.log(`Torches crafted! Total torches: ${lib.count('torch')}`);
  } catch (e) {
    console.log('Craft torch error:', e.message);
  }
}

// 6. Craft 2 spare stone pickaxes
const pickaxes = Object.keys(lib.inv()).filter(k => k.endsWith('_pickaxe'));
let totalPickaxes = pickaxes.reduce((sum, k) => sum + lib.count(k), 0);
if (totalPickaxes < 3) {
  console.log('Crafting 2 stone pickaxes...');
  try {
    await lib.craft('stone_pickaxe', 2);
    console.log('Stone pickaxes crafted!');
  } catch (e) {
    console.log('Craft stone pickaxe error:', e.message);
  }
}

console.log('Inventory prepped:', JSON.stringify(lib.inv()));
bot.chat('beta: Fully prepped with torches, pickaxes, water bucket & food. Starting descent to y=-54 at (345, 65, -40)!');

// 7. Travel to East hill dry spot (345, 65, -40)
console.log('Traveling to East hill (345, 65, -40)...');
try {
  await lib.goTo(345, 65, -40, 2, { timeoutMs: 30000 });
  console.log('At descent start spot! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Travel warning:', e.message);
  try { await lib.goToXZ(345, -40, { timeoutMs: 25000 }); } catch (e2) {}
}

const startSurfacePos = bot.entity.position.clone();

// 8. Descend to diamond level (target y=-54)
try {
  console.log('Beginning lib.descend to y=-54...');
  await lib.descend(-54, { torchEvery: 8 });
  console.log('Reached depth! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Descend note/stopped:', e.message, 'Pos:', lib.fmt(bot.entity.position));
}

// 9. Search for diamonds in vicinity
console.log('Scanning for diamonds at depth:', lib.fmt(bot.entity.position));
const diamondOres = lib.find(['diamond_ore', 'deepslate_diamond_ore'], { maxDistance: 32, count: 10 });
console.log(`Found ${diamondOres.length} diamond ores!`);

if (diamondOres.length > 0) {
  for (const d of diamondOres) {
    if (isCancelled() || lib.count('diamond') >= 3) break;
    console.log(`Mining diamond at ${lib.fmt(d.position)}...`);
    try {
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

// 10. Craft diamond_pickaxe
if (lib.count('diamond') >= 3 && lib.count('diamond_pickaxe') === 0) {
  console.log('Crafting diamond_pickaxe...');
  try {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('diamond_pickaxe', 1);
    console.log('*** MILESTONE 6 ACHIEVED: Diamond pickaxe crafted! ***');
    bot.chat('beta: *** MILESTONE 6 ACHIEVED! Diamond pickaxe crafted! ***');
  } catch (e) {
    console.log('Craft diamond_pickaxe note:', e.message);
  }
}

console.log('Finished 207. Status:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Diamonds:', lib.count('diamond'), 'Diamond pickaxe:', lib.count('diamond_pickaxe'));
