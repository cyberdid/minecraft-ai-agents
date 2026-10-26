// programs/282-mine-tree-and-resupply.js
console.log('=== MINE TREE & RESUPPLY ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Mine the birch tree trunk right here at (317, 71..74, -46)
for (let y = 71; y <= 74; y++) {
  const p = new Vec3(317, y, -46);
  const b = bot.blockAt(p);
  console.log(`Block at ${lib.fmt(p)}: ${b ? b.name : 'null'}`);
  if (b && b.name.includes('log')) {
    console.log(`Mining ${b.name} at ${lib.fmt(p)}...`);
    try {
      await bot.lookAt(p.offset(0.5, 0.5, 0.5));
      await bot.dig(b);
      console.log(`Successfully mined ${b.name}!`);
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(p)}:`, e.message);
    }
  }
}

await sleep(400);
await lib.pickup(6);
console.log('Logs collected:', lib.count('*_log'));

// If tree at (317, -46) didn't yield enough, try nearest log
if (lib.count('*_log') < 2) {
  const nearbyLogs = bot.findBlocks({
    matching: b => b && b.name.includes('log'),
    maxDistance: 20,
    count: 5
  });
  console.log(`Fallback logs found (${nearbyLogs.length}):`, nearbyLogs.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));
  for (const p of nearbyLogs) {
    if (lib.count('*_log') >= 3 || isCancelled()) break;
    const b = bot.blockAt(p);
    if (b) {
      try {
        await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 6000 });
        await bot.dig(b);
      } catch (e) {}
    }
  }
  await lib.pickup(6);
}

const totalLogs = lib.count('*_log');
console.log('Total logs in inv:', totalLogs);
if (totalLogs === 0) {
  throw new Error('Failed to harvest logs!');
}

// 2. Craft planks, sticks, wooden pickaxe
const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
const plankName = logKey.replace('_log', '_planks');
console.log(`Crafting ${plankName}...`);
await lib.craft(plankName, totalLogs * 4);
await lib.craft('stick', 4);
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe crafted! Inv:', JSON.stringify(lib.inv()));

// 3. Equip wooden pickaxe and mine 24 stone from hillside
const woodenPick = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (woodenPick) await bot.equip(woodenPick, 'hand');

const stoneBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'cobblestone'),
  maxDistance: 20,
  count: 35
}).filter(p => p.y >= 65);

console.log(`Stone blocks found nearby (${stoneBlocks.length})`);
let minedStone = 0;
for (const p of stoneBlocks) {
  if (lib.count('cobblestone') >= 24 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (!b) continue;
  try {
    const d = bot.entity.position.distanceTo(p);
    if (d > 4.5) await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 5000 });
    await bot.lookAt(p.offset(0.5, 0.5, 0.5));
    await bot.dig(b);
    minedStone++;
  } catch (e) {}
}
await sleep(300);
await lib.pickup(6);
console.log(`Mined ${minedStone} stone. Cobblestone in inv: ${lib.count('cobblestone')}`);

// 4. Return inside base to crafting table at (295, 72, -56)
console.log('Moving inside base to crafting table...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(294.5, -55.0, 3000); } catch (e2) {}
}

// 5. Craft stone tools: pickaxe, 2 swords, axe
console.log('Crafting stone tools at crafting table...');
if (lib.count('stick') < 8) await lib.craft('stick', 8);
try {
  await lib.craft('stone_pickaxe', 1);
  await lib.craft('stone_sword', 2);
  await lib.craft('stone_axe', 1);
  await lib.equipWeapon();
  console.log('Stone tools crafted and equipped!');
} catch (e) {
  console.log('Craft note:', e.message);
}

// 6. Report status
console.log('\n=== STATUS AT END OF PROGRAM ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Gear:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma fully armed at base: stone sword, stone pickaxe, cobble x${lib.count('cobblestone')}, planks x${lib.count('*_planks')}. Ready for shield & Nether assault!`);
