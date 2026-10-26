// programs/487-chop-tree-and-mine-cobble.js
console.log('=== Step: Chop Tree Trunk & Mine Cobble ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', bot.time.nightIn);

// 1. Pick up any dropped logs nearby
await lib.pickup(6);

// 2. Scan for tree logs right around (311, 71..76, -43)
const logs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 8,
  count: 6
});
console.log(`Found ${logs.length} logs in trunk above`);

for (const p of logs) {
  try {
    await lib.dig(p.x, p.y, p.z);
    console.log(`Chopped trunk log at ${lib.fmt(p)}!`);
  } catch (e) {
    console.log('Chop error:', e.message);
  }
}

// Pickup drops
await lib.pickup(6);
console.log('Inv after chopping:', JSON.stringify(lib.inv()));

// 3. Craft planks (2x2 craft)
for (const logItem of bot.inventory.items().filter(i => i.name.endsWith('_log'))) {
  const plankName = logItem.name.replace('_log', '_planks');
  const recipe = bot.recipesFor(mcData.itemsByName[plankName]?.id, null, 1, null)[0];
  if (recipe) {
    await bot.craft(recipe, logItem.count, null);
    console.log(`Crafted ${plankName}!`);
  }
}

// 4. Craft sticks
if (lib.count('*_planks') >= 2) {
  const stickRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (stickRecipe) {
    await bot.craft(stickRecipe, 1, null);
    console.log('Crafted sticks! Total:', lib.count('stick'));
  }
}

// 5. Craft crafting table
if (lib.count('crafting_table') === 0 && lib.count('*_planks') >= 4) {
  const ctRecipe = bot.recipesFor(mcData.itemsByName.crafting_table.id, null, 1, null)[0];
  if (ctRecipe) {
    await bot.craft(ctRecipe, 1, null);
    console.log('Crafted crafting_table!');
  }
}

// 6. Place crafting table and craft wooden pickaxe
const spot = await lib.freeSpot();
if (spot && lib.count('crafting_table') > 0) {
  await lib.place('crafting_table', spot.x, spot.y, spot.z);
  const tb = bot.blockAt(spot);
  if (tb && lib.count('wooden_pickaxe') === 0) {
    const wpRecipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, tb)[0];
    if (wpRecipe) {
      await bot.craft(wpRecipe, 1, tb);
      console.log('SUCCESS: Crafted wooden_pickaxe!');
    }
  }
}

// 7. Mine 3-6 surface stone nearby
const stones = bot.findBlocks({
  matching: b => b.name === 'stone',
  maxDistance: 8,
  count: 5
});
console.log(`Found ${stones.length} surface stone nearby`);

for (const sp of stones) {
  if (lib.count('cobblestone') >= 5) break;
  try {
    await lib.dig(sp.x, sp.y, sp.z);
    console.log(`Mined stone at ${lib.fmt(sp)}!`);
  } catch (e) {}
}

await lib.pickup(6);

// 8. Craft stone pickaxe
if (lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  const tb = bot.findBlocks({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 5 })[0];
  if (tb) {
    const spRecipe = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, bot.blockAt(tb))[0];
    if (spRecipe) {
      await bot.craft(spRecipe, 1, bot.blockAt(tb));
      console.log('SUCCESS: CRAFTED STONE_PICKAXE!');
    }
  }
}

console.log('Final inv:', JSON.stringify(lib.inv()), 'Gear:', JSON.stringify(lib.tools()));
bot.chat(`beta: Tools update! Inv: ${JSON.stringify(lib.inv())}, Tools: ${JSON.stringify(lib.tools())}`);
