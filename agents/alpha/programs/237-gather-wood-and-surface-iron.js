// programs/237-gather-wood-and-surface-iron.js
console.log('=== Program 237: Gather Wood, Craft Stone Tools & Mine Surface Iron ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight);

bot.chat('beta: Morning! I am gathering wood, crafting stone pickaxe, and mining 8 iron ore at East hill (350, 55, -35)!');

// 1. Exit base
console.log('Stepping outside base...');
try {
  if (typeof passDoorOut === 'function') await passDoorOut();
  else await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door exit note:', e.message);
}

// 2. Chop 4 logs from nearby tree
console.log('Collecting 4 logs...');
try {
  await lib.collect('*_log', 4);
  console.log('Logs collected! Current inv:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Collect log error:', e.message);
}

// 3. Craft planks, sticks, stone pickaxe, stone sword
const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logName) {
  const plankName = logName.replace('_log', '_planks');
  await lib.craft(plankName, lib.count(logName) * 4);
}

if (lib.count('*_planks') > 0 && lib.count('stick') < 8) {
  await lib.craft('stick', 8);
}

if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted stone_pickaxe!');
}

if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  await lib.craft('stone_sword', 1);
  console.log('Crafted stone_sword!');
}

const stonePickId = mcData.itemsByName.stone_pickaxe?.id;
if (stonePickId) await bot.equip(stonePickId, 'hand');

// 4. Head to East hill at (350, 55, -35)
console.log('Traveling to safe surface East hill (350, 55, -35)...');
try {
  await lib.goTo(350, 55, -35, 2, { timeoutMs: 30000 });
  console.log('At East hill! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Travel note:', e.message);
}

// 5. Scan and mine exposed coal and iron
const coals = lib.find('coal_ore', { maxDistance: 24, count: 6 });
console.log(`Found ${coals.length} coal ores on hill`);
for (const c of coals) {
  if (isCancelled() || lib.count('coal') >= 4) break;
  try {
    await bot.equip(stonePickId, 'hand');
    await lib.goTo(c.position.x, c.position.y, c.position.z, 2, { dig: true, timeoutMs: 12000 });
    await bot.equip(stonePickId, 'hand');
    await lib.dig(c.position.x, c.position.y, c.position.z);
    await sleep(200);
    await lib.pickup(4);
  } catch (e) {}
}

const irons = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 28, count: 10 });
console.log(`Found ${irons.length} iron ores on hill`);
for (const ore of irons) {
  if (isCancelled() || lib.count('raw_iron') >= 8) break;
  try {
    await bot.equip(stonePickId, 'hand');
    await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true, timeoutMs: 15000 });
    await bot.equip(stonePickId, 'hand');
    await lib.dig(ore.position.x, ore.position.y, ore.position.z);
    await sleep(200);
    await lib.pickup(4);
  } catch (e) {
    console.log('Dig iron error:', e.message);
  }
}

console.log(`Raw iron collected: ${lib.count('raw_iron')}, coal: ${lib.count('coal')}`);

// 6. Return to base entrance
console.log('Returning to base...');
try {
  await lib.goTo(294, 72, -52, 2, { timeoutMs: 35000 });
  if (typeof passDoorIn === 'function') await passDoorIn();
  else await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Return note:', e.message);
}

bot.chat(`beta: Returned to base! Raw iron: ${lib.count('raw_iron')}, Coal: ${lib.count('coal')}. Ready to smelt!`);
console.log('Inventory now:', JSON.stringify(lib.inv()));
