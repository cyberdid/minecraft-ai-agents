// programs/682-mine-stone-and-enter-nether.js
console.log('=== Program 682: Mine Stone, Craft Gear & Warp to Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Convert 1 birch log to 4 planks
for (const item of bot.inventory.items()) {
  if (item.name.endsWith('_log')) {
    const pName = item.name.replace('_log', '_planks');
    const r = bot.recipesFor(mcData.itemsByName[pName].id, null, 1, null)[0];
    if (r) {
      try { await bot.craft(r, 1, null); } catch (e) {}
      break;
    }
  }
}
console.log('Planks available:', lib.count('*_planks'));

// Ensure crafting table placed nearby
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

// Explicitly equip wooden pickaxe
const wp = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wp) {
  await bot.equip(wp, 'hand');
  console.log('Equipped wooden pickaxe!');
}

// Mine 3 stone with wooden pickaxe
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
console.log('Cobblestone for pickaxe:', lib.count('cobblestone'));

// Craft stone pickaxe
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') < 1) {
  console.log('Crafting stone pickaxe...');
  try { await lib.craft('stone_pickaxe', 1); } catch (e) {}
}

// Explicitly equip stone pickaxe
const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) {
  await bot.equip(sp, 'hand');
  console.log('Equipped stone pickaxe!');
}

// Mine 25 cobblestone with stone pickaxe
console.log('Mining 25 cobblestone...');
let q = 0;
while (lib.count('cobblestone') < 25 && q < 35 && !isCancelled()) {
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

// --- Phase 2: Walk to Nether Portal & Warp ---
console.log('Walking to Nether Portal at (298, 73, -54)...');
try {
  await lib.goTo(298, 73, -53, 1.5, { dig: false, timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(298, 73, -53, 1.5)); } catch (e2) {}
}

console.log('Stepping into portal block (299.5, 73.0, -54.0)...');
for (let attempt = 0; attempt < 5; attempt++) {
  const target = new Vec3(299.5, 73.0, -54.0);
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(1200);
  bot.clearControlStates();

  const dist = bot.entity.position.distanceTo(target);
  if (dist < 1.3) break;
  await sleep(300);
}

// Wait for Nether warp
const startDim = bot.game.dimension;
for (let s = 0; s < 20; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim || bot.game.dimension.includes('nether')) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}`);
    break;
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobble: lib.count('cobblestone'),
  swords: lib.count('stone_sword'),
  pickaxes: lib.count('stone_pickaxe'),
  inv: lib.inv()
};
