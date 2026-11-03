// programs/312-craft-tools-and-quarry.js
console.log('=== CRAFT TOOLS & QUARRY ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Craft sticks & wooden pickaxe
console.log('Crafting sticks & wooden pickaxe...');
if (lib.count('stick') < 8) await lib.craft('stick', 8);
if (lib.count('wooden_pickaxe') === 0 && lib.count('stone_pickaxe') === 0) {
  await lib.craft('wooden_pickaxe', 1);
}

console.log('Inv after wood tools:', JSON.stringify(lib.inv()));

// 2. Equip wooden pickaxe
const wp = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wp) await bot.equip(wp, 'hand');

// 3. Find exposed stone/andesite/diorite (y >= 65)
console.log('Finding exposed stone...');
const stoneBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 20,
  count: 45
}).filter(p => p.y >= 65);

console.log(`Found ${stoneBlocks.length} stone blocks.`);

// Mine 3 stone first to get stone pickaxe
let mined = 0;
for (const p of stoneBlocks) {
  if (lib.count('cobblestone') >= 3 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (!b) continue;
  try {
    if (bot.entity.position.distanceTo(p) > 4) await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 4000 });
    await bot.lookAt(p.offset(0.5, 0.5, 0.5));
    await bot.dig(b);
    mined++;
  } catch (e) {}
}
await sleep(250);
await lib.pickup(6);

// Craft stone pickaxe
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  console.log('Crafting stone_pickaxe...');
  await lib.craft('stone_pickaxe', 1);
}

// Equip stone pickaxe
const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

// Mine 2 more stone for stone sword
for (const p of stoneBlocks) {
  if (lib.count('cobblestone') >= 2 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (!b) continue;
  try {
    if (bot.entity.position.distanceTo(p) > 4) await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 4000 });
    await bot.lookAt(p.offset(0.5, 0.5, 0.5));
    await bot.dig(b);
  } catch (e) {}
}
await sleep(250);
await lib.pickup(6);

// Craft stone sword
if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
  console.log('Crafting stone_sword...');
  await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
}

// Now quarry until we have at least 32 cobblestone
console.log('Quarrying cobblestone up to 32 blocks...');
const moreStones = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 24,
  count: 50
}).filter(p => p.y >= 65);

for (const p of moreStones) {
  if (lib.count('cobblestone') >= 32 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (!b) continue;
  try {
    if (bot.entity.position.distanceTo(p) > 4) await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 4000 });
    await bot.lookAt(p.offset(0.5, 0.5, 0.5));
    await bot.dig(b);
  } catch (e) {}
}

await sleep(300);
await lib.pickup(6);

console.log('\n=== STATUS AT END ===');
console.log('Cobblestone:', lib.count('cobblestone'));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed with stone_sword, stone_pickaxe, and ${lib.count('cobblestone')} cobblestone!`);
