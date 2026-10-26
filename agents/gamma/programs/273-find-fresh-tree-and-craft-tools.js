// programs/273-find-fresh-tree-and-craft-tools.js
console.log('=== FIND FRESH TREE, MINE STONE & CRAFT WEAPONS ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Step outside base door
console.log('Stepping outside door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(294.5, -52.0, 3000); } catch (e2) {}
}

// 2. Find ground-level tree logs within 40m
const allLogs = lib.find('*_log', { maxDistance: 40, count: 20 });
console.log(`Found ${allLogs.length} total logs:`);
const lowLogs = allLogs.filter(l => l.position.y <= 74);
console.log(`Ground-level trunk logs (${lowLogs.length}):`, lowLogs.slice(0, 5).map(l => `${l.name} at ${lib.fmt(l.position)}`));

if (lowLogs.length === 0) throw new Error('No accessible ground-level logs found within 40m!');

const targetLog = lowLogs[0];
console.log(`Walking to target tree at ${lib.fmt(targetLog.position)}...`);
await lib.goTo(targetLog.position.x, targetLog.position.y, targetLog.position.z, 2, { timeoutMs: 15000 });

// Dig 3 logs from this tree trunk
console.log('Mining 3 logs from tree trunk...');
for (let dy = 0; dy <= 2; dy++) {
  const p = new Vec3(targetLog.position.x, targetLog.position.y + dy, targetLog.position.z);
  const b = bot.blockAt(p);
  if (b && b.name.includes('log')) {
    console.log(`Mining ${b.name} at ${lib.fmt(p)}...`);
    try { await lib.dig(p.x, p.y, p.z); } catch (e) {}
  }
}
await sleep(300);
await lib.pickup(6);
console.log('Logs collected:', lib.count('*_log'));

// 3. Craft planks, sticks, wooden pickaxe
const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (!logKey) throw new Error('Failed to collect logs!');

const plankName = logKey.replace('_log', '_planks');
console.log(`Crafting ${plankName}...`);
await lib.craft(plankName, 12);
await lib.craft('stick', 4);
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe ready! Inv:', JSON.stringify(lib.inv()));

// 4. Find exposed stone (y >= 65) and mine 12 stone
const stoneList = bot.findBlocks({
  matching: b => b && b.name === 'stone',
  maxDistance: 24,
  count: 30
}).filter(p => p.y >= 65);

console.log(`Stone blocks found (${stoneList.length}):`);
for (let i = 0; i < Math.min(12, stoneList.length); i++) {
  const p = stoneList[i];
  if (lib.count('cobblestone') >= 10) break;
  try {
    const d = bot.entity.position.distanceTo(p);
    if (d > 4) await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 8000 });
    await lib.dig(p.x, p.y, p.z);
  } catch (e) {}
}
await sleep(300);
await lib.pickup(6);
console.log('Cobblestone collected:', lib.count('cobblestone'));

// 5. Craft stone tools: stone_pickaxe & stone_sword
console.log('Crafting stone tools...');
if (lib.count('stick') < 4) await lib.craft('stick', 4);
try {
  await lib.craft('stone_pickaxe', 1);
  await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
  console.log('Stone tools crafted and equipped!');
} catch (e) {
  console.log('Craft error:', e.message);
}

console.log('=== GEAR COMPLETE ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Cobblestone:', lib.count('cobblestone'));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma armed: ${bot.entity.equipment[0]?.name || 'tools'} in hand, cobble x${lib.count('cobblestone')}! Ready for Nether.`);
