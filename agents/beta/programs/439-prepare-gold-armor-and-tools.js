// programs/439-prepare-gold-armor-and-tools.js
console.log('=== Step: Prepare wood/tools at base, enter Nether, mine gold for golden_boots ===');
console.log('Current pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Announce team plan
bot.chat('beta: Base team assembled! Chopping wood for tools, then mining gold at Nether bunker for golden boots (neutral Piglins)!');

// 2. Step outside door (294, 72, -54)
try {
  await lib.goThroughDoor(294, 72, -54, { close: false });
} catch (e) {}

// 3. Chop 2 tree logs nearby
const logBlocks = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 15,
  count: 2
});

for (const lp of logBlocks) {
  if (isCancelled() || lib.count('oak_log') + lib.count('birch_log') >= 2) break;
  try {
    await lib.goTo(lp.x, lp.y, lp.z, 2);
    await lib.dig(lp.x, lp.y, lp.z);
    console.log(`Chopped log at ${lib.fmt(lp)}!`);
  } catch (e) {}
}

// 4. Craft planks and sticks in inventory
const log = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (log) {
  const ptype = log.name.replace('_log', '_planks');
  const pr = bot.recipesFor(mcData.itemsByName[ptype]?.id || mcData.itemsByName.oak_planks.id, null, 1, null)[0];
  if (pr) await bot.craft(pr, 2, null);
  const sr = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (sr) await bot.craft(sr, 2, null);
  console.log(`Crafted sticks! Total: ${lib.count('stick')}`);
}

// 5. Withdraw cobblestone from base chest (293, 72, -57)
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const stones = chest.containerItems().filter(i => ['cobblestone', 'granite', 'diorite', 'andesite'].includes(i.name));
    for (const st of stones) {
      if (lib.count('cobblestone') + lib.count('granite') >= 64) break;
      await chest.withdraw(st.type, null, Math.min(st.count, 32));
    }
    chest.close();
  } catch (e) {}
}

// 6. Craft stone sword & stone pickaxe at crafting table (295, 72, -56)
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (tableBlock && lib.count('stick') >= 2) {
  const swr = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, tableBlock)[0];
  if (swr) await bot.craft(swr, 2, tableBlock);
  const pkr = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tableBlock)[0];
  if (pkr) await bot.craft(pkr, 2, tableBlock);
  console.log(`Tools ready: swords=${lib.count('stone_sword')}, pickaxes=${lib.count('stone_pickaxe')}`);
}

// 7. Enter Nether portal (299, 73, -54)
console.log('Entering Nether portal...');
try {
  await lib.goTo(299, 73, -54, 0.5);
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
      console.log('Arrived in Nether bunker! Pos:', lib.fmt(bot.entity.position));
      break;
    }
  }
} catch (e) {}

// 8. If in Nether, mine nether_gold_ore within 12m of bunker
if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
  const goldOres = bot.findBlocks({
    matching: b => b.name === 'nether_gold_ore',
    maxDistance: 12,
    count: 8
  });
  console.log(`Gold ores near bunker: ${goldOres.length}`);
  for (const gp of goldOres) {
    if (isCancelled() || lib.count('gold_nugget') >= 36) break;
    try {
      const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
      if (pick) await bot.equip(pick, 'hand');
      await lib.goTo(gp.x, gp.y, gp.z, 2);
      await lib.dig(gp.x, gp.y, gp.z);
      console.log(`Mined gold ore at ${lib.fmt(gp)}! Nuggets: ${lib.count('gold_nugget')}`);
    } catch (e) {}
  }
}

console.log(`Cycle complete. Dim: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}, nuggets: ${lib.count('gold_nugget')}`);
bot.chat(`beta: Nether gold preparation complete! Nuggets=${lib.count('gold_nugget')}, Swords=${lib.count('stone_sword')}. Crafting gold boots!`);
