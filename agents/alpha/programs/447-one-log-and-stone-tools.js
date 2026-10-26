// programs/447-one-log-and-stone-tools.js
console.log('=== Program 447: Target 2 Logs & Stone Tools ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Find accessible log blocks (not high in the canopy)
const findAccessibleLogs = (count = 2) => {
  const blocks = bot.findBlocks({
    matching: b => {
      const bl = bot.blockAt(b);
      return bl && bl.name.endsWith('_log');
    },
    maxDistance: 24,
    count: 20
  });
  return blocks
    .filter(p => Math.abs(p.y - bot.entity.position.y) <= 2)
    .sort((a, b) => a.distanceTo(bot.entity.position) - b.distanceTo(bot.entity.position))
    .slice(0, count);
};

let logs = findAccessibleLogs(2);
console.log(`Found ${logs.length} accessible logs nearby`);

if (logs.length < 2) {
  // If no eye-level logs right here, look within 32 blocks
  const anyLogs = bot.findBlocks({
    matching: b => bot.blockAt(b)?.name.endsWith('_log'),
    maxDistance: 32,
    count: 5
  });
  console.log(`Found ${anyLogs.length} total logs within 32 blocks:`, anyLogs.map(p => lib.fmt(p)).join(', '));
  if (anyLogs.length > 0) logs = anyLogs.slice(0, 2);
}

for (const lp of logs) {
  if (lib.count('*_log') >= 2) break;
  console.log(`Digging log at ${lib.fmt(lp)}...`);
  try {
    const block = bot.blockAt(lp);
    if (!block || !block.name.endsWith('_log')) continue;
    await bot.pathfinder.goto(new goals.GoalLookAtBlock(lp, bot.world));
    await bot.dig(block);
    await lib.pickup(5);
  } catch (err) {
    console.log(`Error digging log at ${lib.fmt(lp)}:`, err.message);
  }
}

console.log('Inventory after digging logs:', JSON.stringify(lib.inv()));

// 2. Convert logs to planks
const woodItems = bot.inventory.items().filter(i => i.name.endsWith('_log'));
for (const item of woodItems) {
  const plankName = item.name.replace('_log', '_planks');
  try {
    await lib.craft(plankName, item.count * 4);
  } catch (e) {
    console.log('Craft plank note:', e.message);
  }
}
console.log('Planks now:', lib.count('*_planks'));

// 3. Craft wooden pickaxe
if (lib.count('*_pickaxe') === 0) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  console.log('Crafting wooden_pickaxe...');
  // Head to base crafting table at (295, 72, -56) if nearby to avoid wasting planks
  if (bot.entity.position.distanceTo(new Vec3(295, 72, -56)) < 30) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(295, 72, -56, 3));
    } catch (e) {}
  }
  await lib.craft('wooden_pickaxe', 1);
  console.log('Wooden pickaxe crafted!');
}

// 4. Mine stone for stone pickaxe & cobblestone
console.log('Finding stone blocks...');
const stoneBlocks = bot.findBlocks({
  matching: mcData.blocksByName.stone.id,
  maxDistance: 16,
  count: 25
});
console.log(`Found ${stoneBlocks.length} stone blocks nearby`);

// Mine first 3 stone for stone pickaxe
for (const sp of stoneBlocks.slice(0, 3)) {
  try {
    const b = bot.blockAt(sp);
    if (!b || b.name !== 'stone') continue;
    await bot.pathfinder.goto(new goals.GoalLookAtBlock(sp, bot.world));
    await lib.equipWeapon(); // equips pickaxe
    const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
    if (pick) await bot.equip(pick, 'hand');
    await bot.dig(b);
    await lib.pickup(4);
  } catch (err) {
    console.log('Dig stone note:', err.message);
  }
}

console.log('Cobblestone count:', lib.count('cobblestone'));

// Craft stone pickaxe
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  await lib.craft('stone_pickaxe', 1);
  console.log('Stone pickaxe crafted!');
}

// Mine more cobblestone up to 24 with the stone pickaxe
if (lib.count('stone_pickaxe') > 0) {
  const remainingStone = bot.findBlocks({
    matching: mcData.blocksByName.stone.id,
    maxDistance: 16,
    count: 20
  });
  for (const sp of remainingStone) {
    if (lib.count('cobblestone') >= 24) break;
    try {
      const b = bot.blockAt(sp);
      if (!b || b.name !== 'stone') continue;
      await bot.pathfinder.goto(new goals.GoalLookAtBlock(sp, bot.world));
      const pick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
      if (pick) await bot.equip(pick, 'hand');
      await bot.dig(b);
      await lib.pickup(4);
    } catch (e) {}
  }
}

// Craft stone sword
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
  if (lib.count('stick') < 1) await lib.craft('stick', 4);
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  } catch (e) {}
}

await lib.equipWeapon();
console.log('STATUS SUMMARY:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha ready! Tools: ${JSON.stringify(lib.tools())}, Cobble: ${lib.count('cobblestone')}`);
