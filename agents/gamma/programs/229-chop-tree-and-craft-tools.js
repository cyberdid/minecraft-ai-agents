// programs/229-chop-tree-and-craft-tools.js
console.log('=== CHOP UNTOUCHED BIRCH TREE AT X=270 & CRAFT STONE GEAR ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time until night:', lib.time().secondsUntilNight);

// 1. Exit base door
console.log('Stepping through base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(294.5, -52.0, 3000); } catch (e2) {}
}

// 2. Walk to birch tree at (270, 72, -52)
console.log('Walking to tree at (272, 72, -52)...');
await lib.goTo(272, 72, -52, 2, { timeoutMs: 15000 });

// 3. Dig 3 logs from bottom to top
const treeLogs = [
  new Vec3(270, 72, -52),
  new Vec3(270, 73, -52),
  new Vec3(270, 74, -52)
];

for (const p of treeLogs) {
  const b = bot.blockAt(p);
  if (b && b.name.includes('log')) {
    console.log(`Mining ${b.name} at ${lib.fmt(p)}...`);
    await lib.dig(p.x, p.y, p.z);
  }
}
await sleep(300);
await lib.pickup(6);
console.log('Logs in inventory:', lib.count('*_log'));

// If we need 1 more log, check (270, 75, -52) or nearby (267, 72, -55)
if (lib.count('*_log') < 3) {
  const extra = bot.blockAt(new Vec3(270, 75, -52));
  if (extra && extra.name.includes('log')) {
    await lib.dig(270, 75, -52);
    await lib.pickup(6);
  }
}

// 4. Craft planks, sticks, wooden pickaxe
const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logName) {
  const plankName = logName.replace('_log', '_planks');
  console.log(`Crafting planks from ${logName}...`);
  await lib.craft(plankName, 12);
  await lib.craft('stick', 4);
  await lib.craft('wooden_pickaxe', 1);
  console.log('Wooden pickaxe ready! Inv:', JSON.stringify(lib.inv()));
}

// 5. Mine 16 stone
console.log('Mining 16 stone...');
try {
  await lib.collect('stone', 16);
  console.log('Cobblestone count:', lib.count('cobblestone'));
} catch (e) {
  console.log('Stone collect note:', e.message);
}

// 6. Craft stone tools: pickaxe, sword, axe
if (lib.count('cobblestone') >= 8) {
  console.log('Crafting stone tools...');
  if (lib.count('stick') < 6) {
    const plankName = Object.keys(lib.inv()).find(k => k.endsWith('_planks'));
    if (plankName) await lib.craft('stick', 4);
  }
  await lib.craft('stone_pickaxe', 1);
  await lib.craft('stone_sword', 1);
  await lib.craft('stone_axe', 1);
  await lib.equipWeapon();
}

// 7. Check final inventory and position
console.log('=== GEAR SUMMARY ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
console.log('Health:', bot.health, 'Food:', bot.food);

bot.chat(`gamma geared: ${JSON.stringify(lib.tools())}, cobble x${lib.count('cobblestone')}, wood x${lib.count('*_planks')}`);
