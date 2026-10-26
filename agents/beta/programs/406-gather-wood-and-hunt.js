// programs/406-gather-wood-and-hunt.js
console.log('=== Step: Step out, chop wood, craft fresh pickaxes, and hunt animals ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Step through base door (294, 72, -54)
console.log('Stepping through base door...');
await lib.goThroughDoor(294, 72, -54);
console.log('Outside base! Pos:', lib.fmt(bot.entity.position));

// 2. Find and chop logs nearby (within 20m)
const logBlocks = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 20,
  count: 4
});
console.log(`Found ${logBlocks.length} log blocks.`);
for (const lp of logBlocks) {
  if (isCancelled() || lib.count('birch_log') + lib.count('oak_log') >= 4) break;
  try {
    await lib.goTo(lp.x, lp.y, lp.z, 2);
    await lib.dig(lp.x, lp.y, lp.z);
    console.log(`Mined log at ${lib.fmt(lp)}!`);
  } catch (e) {
    console.log('Log mine error:', e.message);
  }
}

// 3. Craft planks, sticks, and 2 stone pickaxes
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem) {
  const plankName = logItem.name.replace('_log', '_planks');
  const pr = bot.recipesFor(mcData.itemsByName[plankName]?.id || mcData.itemsByName.oak_planks.id, null, 1, null)[0];
  if (pr) {
    await bot.craft(pr, 2, null);
    console.log('Crafted planks.');
    const sr = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
    if (sr) {
      await bot.craft(sr, 2, null);
      console.log(`Crafted sticks! Total sticks: ${lib.count('stick')}`);
    }
  }
}

// Craft stone pickaxes if we have sticks and cobblestone
if (lib.count('stick') >= 2 && lib.count('cobblestone') >= 3) {
  // Can use portable crafting or base table if nearby
  const pickRecipe = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, null)[0];
  // Note: stone pickaxe requires 3x3 crafting table
  const table = bot.findBlocks({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 15, count: 1 })[0];
  if (table) {
    const tableBlock = bot.blockAt(table);
    const tr = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tableBlock)[0];
    if (tr) {
      await bot.craft(tr, 2, tableBlock);
      console.log(`Crafted 2 fresh stone pickaxes! Count: ${lib.count('stone_pickaxe')}`);
    }
  }
}

// 4. Hunt animals North of base (294, 72, -50 to -90)
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) < 40
);
console.log(`Found ${animals.length} animals within 40m`);

let hunted = 0;
for (const a of animals) {
  if (isCancelled() || hunted >= 4) break;
  try {
    console.log(`Hunting ${a.name} at ${lib.fmt(a.position)}...`);
    const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
    if (sword) await bot.equip(sword, 'hand');
    await lib.goTo(a.position.x, a.position.y, a.position.z, 2);
    await bot.attack(a);
    await sleep(500);
    hunted++;
  } catch (e) {
    console.log('Hunt error:', e.message);
  }
}

// 5. Check food gathered
const meats = lib.count('beef') + lib.count('mutton') + lib.count('porkchop') + lib.count('chicken');
console.log(`Expedition finished. Raw meat gathered: ${meats}, pos: ${lib.fmt(bot.entity.position)}`);
bot.chat(`beta: Gathered wood and hunted animals! Raw meat: ${meats}, pickaxes: ${lib.count('stone_pickaxe')}. Returning to base furnaces!`);
