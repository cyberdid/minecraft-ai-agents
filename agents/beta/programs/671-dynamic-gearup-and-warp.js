// programs/671-dynamic-gearup-and-warp.js
console.log('=== Program 671: Dynamic Tree Harvest, Stone Gear & Nether Warp ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- Phase 1: Dynamically Find Reachable Tree ---
console.log('Phase 1: Finding nearest intact ground log...');
const logs = lib.find('*_log', { maxDistance: 45, count: 50 })
  .filter(l => l.position.y <= 76);

if (logs.length === 0) {
  console.log('No ground logs <= 76 found within 45m!');
  return { error: 'no_ground_logs' };
}

const targetLog = logs[0];
console.log(`Targeting log at ${targetLog.position}...`);

try {
  await lib.goTo(targetLog.position.x, targetLog.position.y, targetLog.position.z, 2, { dig: false, timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(targetLog.position.x, targetLog.position.y, targetLog.position.z, 2)); } catch (e2) {}
}

// Dig the log and the trunk blocks above it
const tx = targetLog.position.x;
const tz = targetLog.position.z;
const baseY = targetLog.position.y;
for (let dy = 0; dy <= 4; dy++) {
  const p = new Vec3(tx, baseY + dy, tz);
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

// --- Phase 2: Mine Cobblestone at Quarry Ledge ---
console.log('Phase 2: Moving to quarry ledge (302, 68, -42)...');
try {
  await lib.goTo(302, 68, -42, 1.5, { dig: false, timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(302, 68, -42, 1.5)); } catch (e2) {}
}

// Ensure crafting table
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

// Mine 25 cobblestone
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
console.log('Armed! Inv:', JSON.stringify(lib.inv()));

// --- Phase 3: Walk to Nether Portal & Warp ---
console.log('Phase 3: Entering Nether Portal at (298, 73, -54)...');
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
