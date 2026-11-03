// programs/342-quarry-stone-and-warp.js
console.log('=== QUARRY STONE & WARP NETHER ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Equip wooden pickaxe
const wp = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wp) await bot.equip(wp, 'hand');

// 2. Find stone blocks adjacent
const stones = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 6,
  count: 45
});
console.log(`Found ${stones.length} stone blocks nearby.`);

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
console.log('Cobblestone for pickaxe:', lib.count('cobblestone'));

// Craft stone pickaxe
if (lib.count('cobblestone') >= 3) {
  console.log('Crafting stone_pickaxe...');
  await lib.craft('stone_pickaxe', 1);
}
const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

// Mine stone with stone pickaxe up to 30 cobblestone
for (const p of stones) {
  if (lib.count('cobblestone') >= 30 || isCancelled()) break;
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

// 3. Craft 2 stone swords
if (lib.count('cobblestone') >= 4) {
  console.log('Crafting stone swords...');
  try {
    await lib.craft('stone_sword', 2);
    await lib.equipWeapon();
  } catch (e) {}
}

console.log('Gear ready! Inv:', JSON.stringify(lib.inv()));

// 4. Move to Nether portal at (299.5, 73.0, -53.5)
console.log('Marching to Nether portal...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 8000 });
} catch (e) {}

// Step into portal block at y=73
bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Inside portal, waiting for warp...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('\n=== WARP COMPLETE ===');
console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
bot.chat(`gamma warped to Nether! Pos: ${lib.fmt(bot.entity.position)}, Cobble: ${lib.count('cobblestone')}, Swords: ${lib.count('stone_sword')}`);
