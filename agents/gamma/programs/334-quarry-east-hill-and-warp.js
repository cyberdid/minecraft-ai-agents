// programs/334-quarry-east-hill-and-warp.js
console.log('=== QUARRY EAST HILL & WARP ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Walk to safe quarry hillside at (315, 67, -54)
console.log('Walking to quarry hillside at (315, 67, -54)...');
try {
  await lib.goTo(315, 67, -54, 2, { timeoutMs: 12000 });
} catch (e) {
  try { await lib.goToXZ(315, -54, { timeoutMs: 8000 }); } catch (e2) {}
}

console.log('Arrived at quarry site:', lib.fmt(bot.entity.position));

// 2. Equip wooden pickaxe
const wp = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (wp) await bot.equip(wp, 'hand');

// 3. Find adjacent stone
const stones = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 8,
  count: 45
});
console.log(`Found ${stones.length} stone blocks.`);

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

// Fast quarry to 32 cobblestone
for (const p of stones) {
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

// 4. Craft 2 stone swords
if (lib.count('cobblestone') >= 4) {
  console.log('Crafting stone swords...');
  try {
    await lib.craft('stone_sword', 2);
    await lib.equipWeapon();
  } catch (e) {
    console.log('Sword craft note:', e.message);
  }
}

console.log('Gear ready! Inv:', JSON.stringify(lib.inv()));

// 5. Walk directly into Nether portal at (299.5, 73.0, -53.5)
console.log('Moving to Nether portal...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 8000 });
} catch (e) {}

// Step into portal block at y=73
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
console.log('HP:', bot.health, 'Food:', bot.food);
bot.chat(`gamma warped to Nether! Pos: ${lib.fmt(bot.entity.position)}, Cobble: ${lib.count('cobblestone')}, Swords: ${lib.count('stone_sword')}`);
