// programs/341-fast-gearup-and-warp.js
console.log('=== FAST GEARUP & NETHER WARP ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Exit base door at (294, 72, -54)
console.log('Stepping outside base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -51.5, 2000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 2. Harvest 4 logs from nearby tree
console.log('Collecting 4 logs...');
try {
  await lib.collect('*_log', 4);
} catch (e) {
  console.log('Collect log note:', e.message);
}
console.log('Logs collected:', lib.count('*_log'));

const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logKey) {
  const plankKey = logKey.replace('_log', '_planks');
  await lib.craft(plankKey, lib.count(logKey) * 4);
}
if (lib.count('stick') < 8) await lib.craft('stick', 8);
if (lib.count('wooden_pickaxe') === 0 && lib.count('stone_pickaxe') === 0) {
  await lib.craft('wooden_pickaxe', 1);
}

// 3. Move to quarry at (315, 67, -54)
console.log('Moving to hillside quarry...');
try {
  await lib.goTo(315, 67, -54, 2, { timeoutMs: 8000 });
} catch (e) {
  try { await lib.goToXZ(315, -54, { timeoutMs: 6000 }); } catch (e2) {}
}

// Equip wooden pickaxe
const wp = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wp) await bot.equip(wp, 'hand');

// Find stone blocks
const stones = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 8,
  count: 45
});

// Mine 3 stone for stone_pickaxe
for (const p of stones) {
  if (lib.count('cobblestone') >= 3 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (b) {
    try {
      await bot.lookAt(p.offset(0.5, 0.5, 0.5));
      await bot.dig(b);
    } catch (e) {}
  }
}
await sleep(200);
await lib.pickup(5);

// Craft stone pickaxe and equip it
if (lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
}
const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

// Mine 32 more stone with stone pickaxe
for (const p of stones) {
  if (lib.count('cobblestone') >= 35 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (b) {
    try {
      await bot.lookAt(p.offset(0.5, 0.5, 0.5));
      await bot.dig(b);
    } catch (e) {}
  }
}
await sleep(250);
await lib.pickup(6);
console.log('Cobblestone count:', lib.count('cobblestone'));

// 4. Craft 2 stone swords
if (lib.count('cobblestone') >= 4) {
  try {
    await lib.craft('stone_sword', 2);
    await lib.equipWeapon();
  } catch (e) {}
}

console.log('Gear ready! Inv:', JSON.stringify(lib.inv()));

// 5. Enter Nether portal at (299.5, 73.0, -53.5)
console.log('Entering Nether portal at (299.5, 73.0, -53.5)...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 6000 });
} catch (e) {}

// Step into portal block at y=73
bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Waiting for Nether transit inside portal...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('\n=== WARP COMPLETE ===');
console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma warped to Nether! Pos: ${lib.fmt(bot.entity.position)}, Cobble: ${lib.count('cobblestone')}, Swords: ${lib.count('stone_sword')}`);
