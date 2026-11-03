// programs/662-harvest-birch-and-mine.js
console.log('=== Program 662: Harvest Birch Tree & Quarry Cobblestone ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Step 1: Walk to base of tree at (308, -28)
console.log('Step 1: Walking to birch tree at (308, y, -28)...');
try {
  await lib.goTo(307, 74, -28, 1.5, { dig: false, timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(307, 74, -28, 1.5)); } catch (e2) {}
}
console.log('At tree! Pos:', lib.fmt(bot.entity.position));

// Dig 4 logs from (308, 75..78, -28)
for (let y = 74; y <= 78; y++) {
  const p = new Vec3(308, y, -28);
  const b = bot.blockAt(p);
  if (b && b.name.includes('log')) {
    console.log(`Digging log at ${p}...`);
    try { await lib.dig(p.x, p.y, p.z); } catch (e) {}
  }
}
await lib.pickup(5);
console.log('Logs collected:', lib.count('*_log'));

// Convert logs to planks in 2x2
for (const item of bot.inventory.items()) {
  if (item.name.endsWith('_log')) {
    const pName = item.name.replace('_log', '_planks');
    const r = bot.recipesFor(mcData.itemsByName[pName].id, null, 1, null)[0];
    if (r) {
      try { await bot.craft(r, item.count, null); } catch (e) {}
    }
  }
}
console.log('Planks:', lib.count('*_planks'));

// Craft sticks in 2x2
if (lib.count('stick') < 8 && lib.count('*_planks') >= 4) {
  try { await lib.craft('stick', 8); } catch (e) {}
}

// Craft portable crafting table in 2x2
if (lib.count('crafting_table') < 1 && lib.count('*_planks') >= 4) {
  try { await lib.craft('crafting_table', 1); } catch (e) {}
}

// Step 2: Walk to quarry ledge (302, 68, -42)
console.log('Step 2: Moving to quarry ledge (302, 68, -42)...');
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

// Mine 40 cobblestone
console.log('Mining 40 cobblestone...');
let q = 0;
while (lib.count('cobblestone') < 40 && q < 50 && !isCancelled()) {
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

// Craft stone sword
if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') < 1) {
  console.log('Crafting stone sword...');
  try { await lib.craft('stone_sword', 1); } catch (e) {}
}

await lib.equipWeapon();
console.log('Armed! Final Inv:', JSON.stringify(lib.inv()));

return {
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  swords: lib.count('stone_sword'),
  pickaxes: lib.count('stone_pickaxe'),
  inv: lib.inv()
};
