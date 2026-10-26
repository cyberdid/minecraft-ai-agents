// programs/281-overworld-resupply-and-iron-hunt.js
console.log('=== OVERWORLD RESUPPLY & IRON SCAN ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Time until night:', lib.time().secondsUntilNight);

// 1. Step outside base door
console.log('Stepping outside door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(294.5, -52.0, 3000); } catch (e2) {}
}
console.log('Outside base! Pos:', lib.fmt(bot.entity.position));

// 2. Find and mine 4 logs from ground-level tree
const allLogs = lib.find('*_log', { maxDistance: 45, count: 20 });
const lowLogs = allLogs.filter(l => l.position.y <= 74);
console.log(`Accessible logs (${lowLogs.length}):`, lowLogs.slice(0, 5).map(l => `${l.name} at ${lib.fmt(l.position)}`));

if (lowLogs.length > 0) {
  const target = lowLogs[0];
  console.log(`Walking to tree at ${lib.fmt(target.position)}...`);
  try {
    await lib.goTo(target.position.x, target.position.y, target.position.z, 2, { timeoutMs: 12000 });
    for (let dy = 0; dy <= 2; dy++) {
      const p = target.position.offset(0, dy, 0);
      const b = bot.blockAt(p);
      if (b && b.name.includes('log')) {
        await lib.dig(p.x, p.y, p.z);
      }
    }
    await lib.pickup(5);
  } catch (e) {
    console.log('Tree harvest note:', e.message);
  }
}

console.log('Logs collected:', lib.count('*_log'));

// 3. Craft planks, sticks, wooden pickaxe
const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logKey) {
  const plankName = logKey.replace('_log', '_planks');
  await lib.craft(plankName, lib.count(logKey) * 4);
  await lib.craft('stick', 4);
  await lib.craft('wooden_pickaxe', 1);
}
console.log('Planks & wooden pickaxe ready! Inv:', JSON.stringify(lib.inv()));

// 4. Mine 24 cobblestone on hillside
const stoneBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'cobblestone'),
  maxDistance: 25,
  count: 35
}).filter(p => p.y >= 65);

console.log(`Exposed stone blocks (${stoneBlocks.length})`);
await bot.equip(bot.inventory.items().find(i => i.name.includes('pickaxe')), 'hand');

let minedStone = 0;
for (const p of stoneBlocks) {
  if (lib.count('cobblestone') >= 24 || isCancelled()) break;
  try {
    const d = bot.entity.position.distanceTo(p);
    if (d > 4.5) await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 6000 });
    await lib.dig(p.x, p.y, p.z);
    minedStone++;
  } catch (e) {}
}
await lib.pickup(6);
console.log(`Mined ${minedStone} stone. Cobble count: ${lib.count('cobblestone')}`);

// 5. Craft stone tools: pickaxe, sword, axe
if (lib.count('cobblestone') >= 8) {
  if (lib.count('stick') < 6) await lib.craft('stick', 4);
  try {
    await lib.craft('stone_pickaxe', 1);
    await lib.craft('stone_sword', 1);
    await lib.craft('stone_axe', 1);
    await lib.equipWeapon();
    console.log('Stone tools crafted!');
  } catch (e) {
    console.log('Craft tools note:', e.message);
  }
}

// 6. Scan for iron ore in 40m radius
const ironOres = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore' || b.name === 'raw_iron_block'),
  maxDistance: 40,
  count: 15
});
console.log(`\nIron ores within 40m (${ironOres.length}):`);
for (const ip of ironOres) {
  console.log(`  - ${bot.blockAt(ip)?.name} at ${lib.fmt(ip)} (y=${ip.y}, dist=${bot.entity.position.distanceTo(ip).toFixed(1)}m)`);
}

// 7. Scan for animals in 40m radius
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) && 
  e.position.distanceTo(bot.entity.position) < 40
);
console.log(`\nAnimals within 40m (${animals.length}):`, animals.map(a => `${a.name} at ${lib.fmt(a.position)}`));

console.log('\n=== STATUS AT END OF PROGRAM ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma resupplied: stone tools, cobble x${lib.count('cobblestone')}, planks x${lib.count('*_planks')}. Iron ores found: ${ironOres.length}, Animals: ${animals.length}.`);
