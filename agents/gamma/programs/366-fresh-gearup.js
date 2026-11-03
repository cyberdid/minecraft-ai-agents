// programs/366-fresh-gearup.js
console.log('=== RAPID GEAR-UP: WOOD, STONE, WEAPONS & FOOD ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Exit base door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -52.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// Step 2: Harvest logs
console.log('Harvesting logs...');
try {
  const gotLogs = await lib.collect('*_log', 5);
  console.log('Logs collected:', JSON.stringify(gotLogs));
} catch (e) {
  console.log('Collect log note:', e.message);
}

// Step 3: Craft planks, sticks, wooden pickaxe
const logType = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
const plankType = logType ? logType.replace('_log', '_planks') : 'birch_planks';

if (lib.count('*_log') > 0) {
  await lib.craft(plankType, 16);
  await lib.craft('stick', 8);
  if (lib.count('wooden_pickaxe') === 0 && lib.count('stone_pickaxe') === 0) {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Crafted wooden_pickaxe!');
  }
}

// Step 4: Quarry cobblestone on east hill
console.log('Quarrying 32+ cobblestone on east hill...');
try {
  await lib.goTo(304, 71, -50, 2, { dig: true, timeoutMs: 10000 });
  const cobbleNeeded = Math.max(0, 32 - lib.count('cobblestone'));
  if (cobbleNeeded > 0) {
    const gotStone = await lib.collect('stone', cobbleNeeded);
    console.log('Mined cobblestone:', JSON.stringify(gotStone));
  }
} catch (e) {
  console.log('Quarry error:', e.message);
}

// Step 5: Craft stone pickaxe and 2 stone swords
if (lib.count('cobblestone') >= 7) {
  if (lib.count('stone_pickaxe') === 0) {
    await lib.craft('stone_pickaxe', 1);
  }
  await lib.craft('stone_sword', 2);
  console.log('Crafted stone tools! Stone swords:', lib.count('stone_sword'));
}

// Step 6: Scan for animals near base
const animalTypes = ['sheep', 'cow', 'pig', 'chicken'];
const targets = Object.values(bot.entities)
  .filter(e => e && animalTypes.includes(e.name) && e.position.distanceTo(bot.entity.position) < 40)
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${targets.length} animals nearby`);
for (const t of targets.slice(0, 2)) {
  if (!t.isValid || isCancelled()) break;
  console.log(`Hunting ${t.name}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(t.position.x, t.position.y, t.position.z, 2));
    await lib.equipWeapon();
    const dline = Date.now() + 5000;
    while (t.isValid && Date.now() < dline) {
      bot.attack(t);
      await sleep(550);
    }
    await lib.pickup(5);
  } catch (e) {}
}

// Step 7: Return into base
console.log('Returning to base shelter...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 12000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// Cook any raw meat in base furnace
const rawMeats = ['porkchop', 'beef', 'mutton', 'chicken'].filter(m => lib.count(m) > 0);
if (rawMeats.length > 0) {
  for (const m of rawMeats) {
    const qty = lib.count(m);
    try {
      console.log(`Smelting ${qty}x ${m}...`);
      await lib.smelt(m, plankType, qty);
    } catch (e) {}
  }
}

// Equip weapon
try { await lib.equipWeapon(); } catch (e) {}

console.log('Gear-up complete! Inventory:', JSON.stringify(lib.inv()));
console.log('Status:', JSON.stringify(lib.status()));
