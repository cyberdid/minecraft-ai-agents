// programs/320-streamlined-gearup-and-warp.js
console.log('=== STREAMLINED GEARUP & NETHER WARP ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Exit base towards tree at (317, 72, -40)
console.log('Gathering 6 logs...');
try {
  const gotLogs = await lib.collect('*_log', 6);
  console.log('Gathered logs:', JSON.stringify(gotLogs));
} catch (e) {
  console.log('collect logs note:', e.message);
}

const logCount = lib.count('*_log');
console.log('Logs in inv:', logCount);
if (logCount === 0) {
  throw new Error('No logs gathered!');
}

// 2. Craft planks, sticks, wooden pickaxe
const logType = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
const plankType = logType.replace('_log', '_planks');
await lib.craft(plankType, logCount * 4);
await lib.craft('stick', 8);
await lib.craft('wooden_pickaxe', 1);

const wp = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wp) await bot.equip(wp, 'hand');

// 3. Quarry stone: mine 3 first for stone pickaxe
console.log('Finding exposed stone blocks (y >= 65)...');
const stoneBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 24,
  count: 50
}).filter(p => p.y >= 65);

console.log(`Found ${stoneBlocks.length} stone blocks.`);

for (const p of stoneBlocks) {
  if (lib.count('cobblestone') >= 3 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (!b) continue;
  try {
    if (bot.entity.position.distanceTo(p) > 4) await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 3000 });
    await bot.lookAt(p.offset(0.5, 0.5, 0.5));
    await bot.dig(b);
  } catch (e) {}
}
await sleep(200);
await lib.pickup(5);

// Craft stone pickaxe and equip it
if (lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
  const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
  if (sp) await bot.equip(sp, 'hand');
}

// 4. Quarry remaining stone with stone pickaxe up to 35 cobble
for (const p of stoneBlocks) {
  if (lib.count('cobblestone') >= 35 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (!b) continue;
  try {
    if (bot.entity.position.distanceTo(p) > 4) await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 3000 });
    await bot.lookAt(p.offset(0.5, 0.5, 0.5));
    await bot.dig(b);
  } catch (e) {}
}
await sleep(300);
await lib.pickup(6);
console.log('Cobblestone count:', lib.count('cobblestone'));

// 5. Craft 2 stone swords
if (lib.count('cobblestone') >= 4) {
  await lib.craft('stone_sword', 2);
  await lib.equipWeapon();
  console.log('Crafted and equipped stone_sword!');
}

console.log('Armed! Inventory:', JSON.stringify(lib.inv()));

// 6. Move directly to Nether portal at (299.5, 73.0, -53.5)
console.log('Moving to Nether portal...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 8000 });
} catch (e) {}

// Step up into purple portal block at y=73
bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Standing in portal at ' + lib.fmt(bot.entity.position) + ', waiting for warp...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('\n=== WARP RESULT ===');
console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma warped to Nether! Pos: ${lib.fmt(bot.entity.position)}, Cobble: ${lib.count('cobblestone')}, Swords: ${lib.count('stone_sword')}`);
