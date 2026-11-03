// programs/671-gear-up-and-mine.js
console.log('=== Program 671: Gear Up (Wood & Cobblestone) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Step 1: Exit base door
console.log('Step 1: Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(295, 72, -53, 1, { dig: false });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// Step 2: Collect 4 logs
console.log('Step 2: Collecting 4 logs...');
try {
  await lib.collect('*_log', 4);
  console.log('Logs collected! Count:', lib.count('*_log'));
} catch (e) {
  console.log('lib.collect log note:', e.message);
  // Fallback: manually harvest tree at (308, y, -28) or (317, 72, -77)
  const tree = lib.find('*_log', { maxDistance: 45 })[0];
  if (tree) {
    console.log('Fallback: Walking to tree at', tree.position);
    try {
      await lib.goTo(tree.position.x, tree.position.y, tree.position.z, 2, { dig: false });
      for (let dy = 0; dy <= 4; dy++) {
        const p = tree.position.offset(0, dy, 0);
        const b = bot.blockAt(p);
        if (b && b.name.includes('log')) {
          await lib.dig(p.x, p.y, p.z);
        }
      }
      await lib.pickup(5);
    } catch (e2) {}
  }
}

console.log('Inv after wood:', JSON.stringify(lib.inv()));

// Convert logs to planks
for (const item of bot.inventory.items()) {
  if (item.name.endsWith('_log')) {
    const pName = item.name.replace('_log', '_planks');
    const r = bot.recipesFor(mcData.itemsByName[pName].id, null, 1, null)[0];
    if (r) {
      try { await bot.craft(r, item.count, null); } catch (e) {}
    }
  }
}

// Craft sticks in 2x2
if (lib.count('stick') < 8 && lib.count('*_planks') >= 4) {
  try { await lib.craft('stick', 8); } catch (e) {}
}

// Craft portable crafting table in 2x2
if (lib.count('crafting_table') < 1 && lib.count('*_planks') >= 4) {
  try { await lib.craft('crafting_table', 1); } catch (e) {}
}

// Step 3: Walk to quarry ledge (302, 68, -42)
console.log('Step 3: Moving to quarry ledge (302, 68, -42)...');
try {
  await lib.goTo(302, 68, -42, 1.5, { dig: false, timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(302, 68, -42, 1.5)); } catch (e2) {}
}
console.log('At quarry ledge! Pos:', lib.fmt(bot.entity.position));

// Place crafting table
let ct = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 6 });
if (!ct && lib.count('crafting_table') >= 1) {
  try {
    const spot = await lib.freeSpot();
    await lib.place('crafting_table', spot.x, spot.y, spot.z);
    ct = bot.blockAt(spot);
  } catch (e) {}
}

// Craft wooden pickaxe
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  console.log('Crafting wooden pickaxe...');
  try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
}

// Equip wooden pickaxe
const wp = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (wp) await bot.equip(wp, 'hand');

// Mine 3 stone
console.log('Mining 3 stone for stone pickaxe...');
let dugStone = 0;
while (lib.count('cobblestone') < 3 && dugStone < 10 && !isCancelled()) {
  dugStone++;
  const stone = bot.findBlock({ matching: mcData.blocksByName.stone.id, maxDistance: 4.5 });
  if (stone) {
    try {
      await bot.dig(stone, true);
      await sleep(150);
    } catch (e) {}
  }
}
await lib.pickup(5);

// Craft stone pickaxe
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') < 1) {
  console.log('Crafting stone pickaxe...');
  try { await lib.craft('stone_pickaxe', 1); } catch (e) {}
}

// Equip stone pickaxe
const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

// Mine 35 cobblestone
console.log('Mining 35 cobblestone...');
let q = 0;
while (lib.count('cobblestone') < 35 && q < 45 && !isCancelled()) {
  q++;
  const stone = bot.findBlock({ matching: mcData.blocksByName.stone.id, maxDistance: 4.5 });
  if (stone) {
    try {
      await bot.dig(stone, true);
      await sleep(100);
    } catch (e) {}
  } else {
    break;
  }
}
await lib.pickup(6);
console.log('Cobblestone total:', lib.count('cobblestone'));

// Craft 2 stone swords
if (lib.count('cobblestone') >= 4 && lib.count('stone_sword') < 2) {
  console.log('Crafting stone swords...');
  try { await lib.craft('stone_sword', 2); } catch (e) {}
}

await lib.equipWeapon();
console.log('Armed! Final Inv:', JSON.stringify(lib.inv()));

return {
  pos: bot.entity.position,
  cobble: lib.count('cobblestone'),
  swords: lib.count('stone_sword'),
  pickaxes: lib.count('stone_pickaxe'),
  inv: lib.inv()
};
