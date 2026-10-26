// programs/311-gear-up-wood-stone.js
console.log('=== GEAR UP: WOOD & STONE ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Step outside base door at (294, 72, -54)
console.log('Exiting base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -51.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Outside base at:', lib.fmt(bot.entity.position));

// 2. Collect 6 logs from nearby trees
console.log('Collecting logs...');
try {
  const gotLogs = await lib.collect('*_log', 6);
  console.log('Collected logs:', JSON.stringify(gotLogs));
} catch (e) {
  console.log('collect logs note:', e.message);
}

const totalLogs = lib.count('*_log');
console.log('Logs in inv:', totalLogs);
if (totalLogs === 0) {
  throw new Error('Failed to gather logs!');
}

// 3. Craft planks, sticks, wooden pickaxe
const logType = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
const plankType = logType.replace('_log', '_planks');
await lib.craft(plankType, totalLogs * 4);
await lib.craft('stick', 8);
await lib.craft('wooden_pickaxe', 1);

console.log('Planks:', lib.count('*_planks'), 'Sticks:', lib.count('stick'));

// 4. Equip wooden pickaxe and mine stone at safe hillside (x=310..325, y>=65)
const woodenPick = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
if (woodenPick) await bot.equip(woodenPick, 'hand');

console.log('Finding safe surface stone (y >= 65)...');
const stoneBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'cobblestone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 28,
  count: 45
}).filter(p => p.y >= 65);

console.log(`Found ${stoneBlocks.length} safe stone blocks.`);

let minedCobble = 0;
for (const p of stoneBlocks) {
  if (lib.count('cobblestone') >= 32 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (!b) continue;
  try {
    const d = bot.entity.position.distanceTo(p);
    if (d > 4) await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 5000 });
    await bot.lookAt(p.offset(0.5, 0.5, 0.5));
    await bot.dig(b);
    minedCobble++;
  } catch (e) {}
}

await sleep(300);
await lib.pickup(6);
console.log(`Mined ${minedCobble} blocks. Cobblestone now: ${lib.count('cobblestone')}`);

// 5. Craft stone tools: pickaxe, sword, axe
if (lib.count('cobblestone') >= 8) {
  console.log('Crafting stone tools...');
  if (lib.count('stick') < 6) await lib.craft('stick', 4);
  await lib.craft('stone_pickaxe', 1);
  await lib.craft('stone_sword', 1);
  await lib.craft('stone_axe', 1);
  await lib.equipWeapon();
  console.log('Stone tools crafted and equipped!');
}

console.log('\n=== STATUS AT END ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed with stone tools: sword, pickaxe, axe, cobble x${lib.count('cobblestone')}, planks x${lib.count('*_planks')}`);
