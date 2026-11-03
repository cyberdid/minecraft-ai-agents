// programs/321-quarry-and-enter-nether.js
console.log('=== QUARRY 32 COBBLE & ENTER NETHER ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Equip stone pickaxe
const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

// 2. Quarry stone up to 32 cobblestone
const stoneBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 8,
  count: 40
});

console.log(`Found ${stoneBlocks.length} stone blocks adjacent.`);

let mined = 0;
for (const p of stoneBlocks) {
  if (lib.count('cobblestone') >= 32 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (!b) continue;
  try {
    if (bot.entity.position.distanceTo(p) > 4) await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 2500 });
    await bot.lookAt(p.offset(0.5, 0.5, 0.5));
    await bot.dig(b);
    mined++;
  } catch (e) {}
}

await sleep(250);
await lib.pickup(6);
console.log(`Mined ${mined} stone. Cobblestone now: ${lib.count('cobblestone')}`);

// 3. Craft 2 stone swords
if (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 4) {
  console.log('Crafting stone swords...');
  try {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('stone_sword', 2);
    await lib.equipWeapon();
  } catch (e) {
    console.log('Sword craft note:', e.message);
  }
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

console.log('Waiting inside portal at ' + lib.fmt(bot.entity.position) + ' for dimension shift...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
bot.chat(`gamma warped to Nether! Pos: ${lib.fmt(bot.entity.position)}, Cobble: ${lib.count('cobblestone')}, Swords: ${lib.count('stone_sword')}`);
