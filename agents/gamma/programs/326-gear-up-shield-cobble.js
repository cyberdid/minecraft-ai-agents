// programs/326-gear-up-shield-cobble.js
console.log('=== GEAR UP: SHIELD, WEAPONS & COBBLESTONE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check furnaces inside base first
const furnaces = [new Vec3(295, 72, -54), new Vec3(295, 72, -55), new Vec3(295, 72, -56), new Vec3(295, 72, -57)];
for (const fp of furnaces) {
  const b = bot.blockAt(fp);
  if (b && b.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(b);
      const out = f.outputItem();
      if (out) {
        console.log(`Found ${out.count}x ${out.name} in furnace at ${lib.fmt(fp)}!`);
        await f.takeOutput();
      }
      await f.close();
    } catch (e) {}
  }
}

// 2. Step outside base door at (294, 72, -54)
console.log('Exiting base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.door(294, 72, -54, true); await lib.walkTo(294.5, -51.5, 2000); await lib.door(294, 72, -54, false); } catch (e2) {}
}

console.log('Outside base at:', lib.fmt(bot.entity.position));

// 3. Harvest 6 birch logs
console.log('Collecting 6 logs...');
try {
  await lib.collect('*_log', 6);
} catch (e) {
  console.log('Log collect note:', e.message);
}
console.log('Logs in inv:', lib.count('*_log'));

const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logKey) {
  const plankKey = logKey.replace('_log', '_planks');
  await lib.craft(plankKey, lib.count(logKey) * 4);
}
if (lib.count('stick') < 8) await lib.craft('stick', 8);
if (lib.count('wooden_pickaxe') === 0 && lib.count('stone_pickaxe') === 0) {
  await lib.craft('wooden_pickaxe', 1);
}

// 4. Quarry stone with wooden pickaxe -> stone pickaxe -> 35 cobblestone
console.log('Quarrying stone at safe hillside (y >= 65)...');
const wp = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wp) await bot.equip(wp, 'hand');

const stoneBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 24,
  count: 45
}).filter(p => p.y >= 65);

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

// Craft stone pickaxe
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  await lib.craft('stone_pickaxe', 1);
}
const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

// Fast quarry to 35 cobble
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
if (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 4) {
  await lib.craft('stone_sword', 2);
  await lib.equipWeapon();
  console.log('Crafted stone swords!');
}

console.log('Tools & blocks ready! Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed: 2 stone swords, stone pickaxe, ${lib.count('cobblestone')} cobble, ${lib.count('*_planks')} planks. Ready for Nether!`);
