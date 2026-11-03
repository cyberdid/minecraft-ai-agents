// programs/659-harvest-wood-and-stone.js
console.log('=== Program 659: Harvest Wood & Mine Cobblestone ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Step 1: Find ground logs (y <= 74)
const logs = lib.find('*_log', { maxDistance: 45, count: 20 })
  .filter(b => b.position.y >= 70 && b.position.y <= 74);

console.log(`Found ${logs.length} reachable ground logs.`);
if (logs.length > 0) {
  const targetLog = logs[0];
  console.log(`Targeting log at ${targetLog.position}...`);
  
  // Step outside door if inside base
  if (bot.entity.position.x < 296 && bot.entity.position.z < -53) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  try {
    await lib.goTo(targetLog.position.x, targetLog.position.y, targetLog.position.z, 2, { dig: false });
  } catch (e) {
    console.log('goTo log note:', e.message);
  }

  // Dig 4-5 logs from the tree trunk
  const trunkX = targetLog.position.x;
  const trunkZ = targetLog.position.z;
  for (let dy = 0; dy <= 4; dy++) {
    const p = new Vec3(trunkX, targetLog.position.y + dy, trunkZ);
    const b = bot.blockAt(p);
    if (b && b.name.includes('log')) {
      console.log(`Digging log at ${p}...`);
      try { await lib.dig(p.x, p.y, p.z); } catch (e) {}
    }
  }
  await lib.pickup(5);
}

console.log('Logs collected:', lib.count('*_log'));

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
console.log('Planks:', lib.count('*_planks'));

// Craft sticks in 2x2
if (lib.count('stick') < 8 && lib.count('*_planks') >= 4) {
  try { await lib.craft('stick', 8); } catch (e) {}
}

// Craft portable crafting table in 2x2
if (lib.count('crafting_table') < 1 && lib.count('*_planks') >= 4) {
  try { await lib.craft('crafting_table', 1); } catch (e) {}
}

// Step 2: Go to quarry ledge at (302, 68, -42)
console.log('Moving to quarry ledge at (302, 68, -42)...');
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

// Craft stone sword
if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') < 1) {
  console.log('Crafting stone sword...');
  try { await lib.craft('stone_sword', 1); } catch (e) {}
}

await lib.equipWeapon();

return {
  pos: bot.entity.position,
  cobble: lib.count('cobblestone'),
  sword: lib.count('stone_sword'),
  pickaxe: lib.count('stone_pickaxe'),
  inv: lib.inv()
};
