// programs/486-gather-wood-and-stone-outside.js
console.log('=== Step: Gather Wood & Stone Outside Base ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', bot.time.nightIn);

// 1. Scan and chop 4-5 tree logs
const logs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 20,
  count: 6
});
console.log(`Found ${logs.length} tree logs nearby`);

let chopped = 0;
for (const p of logs) {
  if (isCancelled() || (bot.time.nightIn && bot.time.nightIn < 90)) break;
  try {
    await lib.goTo(p.x, p.y, p.z, 2.5);
    await lib.dig(p.x, p.y, p.z);
    chopped++;
    console.log(`Chopped log at ${lib.fmt(p)} (${chopped}/4)`);
    if (chopped >= 4) break;
  } catch (e) {
    console.log('Chop error:', e.message);
  }
}

// 2. Pickup all drops
await lib.pickup(6);

console.log('Inv after wood:', JSON.stringify(lib.inv()));

// 3. Craft planks and sticks in player 2x2 crafting grid
for (const logItem of bot.inventory.items().filter(i => i.name.endsWith('_log'))) {
  const plankName = logItem.name.replace('_log', '_planks');
  const recipe = bot.recipesFor(mcData.itemsByName[plankName]?.id, null, 1, null)[0];
  if (recipe) {
    await bot.craft(recipe, logItem.count, null);
    console.log(`Crafted ${plankName}!`);
  }
}

// Craft sticks
if (lib.count('*_planks') >= 2) {
  const stickRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (stickRecipe) {
    await bot.craft(stickRecipe, 1, null);
    console.log('Crafted sticks! Total:', lib.count('stick'));
  }
}

// Craft crafting table if we have none
if (lib.count('crafting_table') === 0 && lib.count('*_planks') >= 4) {
  const ctRecipe = bot.recipesFor(mcData.itemsByName.crafting_table.id, null, 1, null)[0];
  if (ctRecipe) {
    await bot.craft(ctRecipe, 1, null);
    console.log('Crafted crafting_table!');
  }
}

// 4. Place crafting table nearby to craft wooden pickaxe
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

console.log('Inv now:', JSON.stringify(lib.inv()));
bot.chat(`beta: Tool progression: wooden pickaxe crafted, inv=${JSON.stringify(lib.inv())}`);
