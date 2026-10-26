// programs/431-quick-arm-and-return-to-nether.js
console.log('=== Step: Quick tool craft in overworld base and return armed to Nether ===');
console.log('Current pos in Nether:', lib.fmt(bot.entity.position));

// 1. Step into Nether portal (40, 65, -7) to go to Overworld
console.log('Stepping into portal frame...');
try {
  await lib.goTo(40, 65, -7, 0.5);
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    if (bot.game.dimension === 'overworld' || bot.game.dimension === 'minecraft:overworld') {
      console.log('Back in overworld! Pos:', lib.fmt(bot.entity.position));
      break;
    }
  }
} catch (e) {
  console.log('Portal step error:', e.message);
}

// 2. If in overworld, chop 1 log near base
if (bot.game.dimension === 'overworld' || bot.game.dimension === 'minecraft:overworld') {
  const logBlock = bot.findBlocks({
    matching: b => b.name.endsWith('_log'),
    maxDistance: 15,
    count: 1
  })[0];

  if (logBlock) {
    try {
      console.log(`Chopping log at ${lib.fmt(logBlock)}...`);
      await lib.goTo(logBlock.x, logBlock.y, logBlock.z, 2);
      await lib.dig(logBlock.x, logBlock.y, logBlock.z);
      console.log('Chopped log!');
    } catch (e) {}
  }

  // 3. Craft planks and sticks in inventory
  const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
  if (logItem) {
    const pr = bot.recipesFor(mcData.itemsByName.birch_planks?.id || mcData.itemsByName.oak_planks.id, null, 1, null)[0];
    if (pr) await bot.craft(pr, 1, null);
    const sr = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
    if (sr) await bot.craft(sr, 1, null);
    console.log(`Sticks in inventory: ${lib.count('stick')}`);
  }

  // 4. Craft 2 stone swords and 1 stone pickaxe at crafting table (295, 72, -56)
  const table = bot.findBlocks({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 15, count: 1 })[0];
  if (table && lib.count('stick') >= 2) {
    const tableBlock = bot.blockAt(table);
    const swr = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, tableBlock)[0];
    if (swr) {
      await bot.craft(swr, 2, tableBlock);
      console.log('Crafted 2 stone swords!');
    }
    const pkr = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tableBlock)[0];
    if (pkr) {
      await bot.craft(pkr, 1, tableBlock);
      console.log('Crafted stone pickaxe!');
    }
  }

  // 5. Re-enter Nether portal (299, 73, -54)
  console.log('Re-entering Nether portal (299, 73, -54)...');
  try {
    await lib.goTo(299, 73, -54, 0.5);
    for (let i = 0; i < 15; i++) {
      await sleep(1000);
      if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
        console.log('Returned to the Nether! Pos:', lib.fmt(bot.entity.position));
        break;
      }
    }
  } catch (e) {}
}

console.log(`Re-arm cycle complete. Dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}, swords: ${lib.count('stone_sword')}`);
bot.chat(`beta: Re-armed with weapons! Pos=${lib.fmt(bot.entity.position)}. Advancing to Nether Fortress (49, 65, -116)!`);
