// programs/335-finish-quarry-and-warp.js
console.log('=== FINISH QUARRY & WARP ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Pick up any dropped cobblestone right here
await sleep(200);
await lib.pickup(6);
console.log('Cobblestone before dig:', lib.count('cobblestone'));

// 2. Equip wooden pickaxe if we have no stone pickaxe
if (lib.count('stone_pickaxe') === 0) {
  const wp = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
  if (wp) await bot.equip(wp, 'hand');

  // Mine stone until we have at least 3 cobble
  const stones = bot.findBlocks({
    matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
    maxDistance: 4,
    count: 10
  });

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

  if (lib.count('cobblestone') >= 3) {
    console.log('Crafting stone_pickaxe...');
    await lib.craft('stone_pickaxe', 1);
  }
}

// 3. Equip stone pickaxe
const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

// 4. Fast quarry to 32 cobblestone
const quarryStones = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 6,
  count: 45
});

for (const p of quarryStones) {
  if (lib.count('cobblestone') >= 32 || isCancelled()) break;
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

// 5. Craft 2 stone swords
if (lib.count('cobblestone') >= 4) {
  console.log('Crafting stone swords...');
  try {
    await lib.craft('stone_sword', 2);
    await lib.equipWeapon();
  } catch (e) {}
}

console.log('Inventory ready:', JSON.stringify(lib.inv()));

// 6. Move directly to Nether portal at (299.5, 73.0, -53.5)
console.log('Moving to Nether portal...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 6000 });
} catch (e) {}

// Step into portal block at y=73
bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Inside portal, waiting for Nether warp...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('\n=== WARP RESULT ===');
console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
bot.chat(`gamma warped to Nether! Pos: ${lib.fmt(bot.entity.position)}, Cobble: ${lib.count('cobblestone')}, Swords: ${lib.count('stone_sword')}`);
