// programs/327-craft-and-quarry.js
console.log('=== CRAFT & FAST QUARRY ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Craft birch planks from 2 birch logs
const logs = lib.count('*_log');
if (logs > 0) {
  console.log(`Crafting ${logs} logs into birch_planks...`);
  await lib.craft('birch_planks', logs * 4);
}
console.log('Planks now:', lib.count('birch_planks'));

// 2. Craft sticks and wooden pickaxe
if (lib.count('stick') < 4) await lib.craft('stick', 4);
if (lib.count('wooden_pickaxe') === 0 && lib.count('stone_pickaxe') === 0) {
  console.log('Crafting wooden_pickaxe...');
  await lib.craft('wooden_pickaxe', 1);
}

const wp = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wp) await bot.equip(wp, 'hand');

// 3. Find adjacent stone blocks
const stones = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 12,
  count: 45
});
console.log(`Found ${stones.length} stone blocks nearby.`);

// Mine 3 stone for stone_pickaxe
for (const p of stones) {
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
  console.log('Crafting stone_pickaxe...');
  await lib.craft('stone_pickaxe', 1);
}
const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

// Mine 2 more stone for stone sword
for (const p of stones) {
  if (lib.count('cobblestone') >= 2 || isCancelled()) break;
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

// Craft stone sword
if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
  console.log('Crafting stone_sword...');
  if (lib.count('stick') < 1) await lib.craft('stick', 4);
  await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
}

// Quarry up to 35 cobblestone with stone pickaxe
if (sp) await bot.equip(sp, 'hand');
for (const p of stones) {
  if (lib.count('cobblestone') >= 35 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (!b) continue;
  try {
    if (bot.entity.position.distanceTo(p) > 4) await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 3000 });
    await bot.lookAt(p.offset(0.5, 0.5, 0.5));
    await bot.dig(b);
  } catch (e) {}
}
await sleep(250);
await lib.pickup(6);

console.log('\n=== STATUS AT END ===');
console.log('Cobblestone:', lib.count('cobblestone'));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed with stone_sword, stone_pickaxe, and ${lib.count('cobblestone')} cobblestone! Ready to warp Nether!`);
