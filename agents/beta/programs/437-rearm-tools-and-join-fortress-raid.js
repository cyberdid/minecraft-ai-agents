// programs/437-rearm-tools-and-join-fortress-raid.js
console.log('=== Step: Re-arm tools, restock 120+ stone blocks, and rejoin Fortress raid ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Withdraw building blocks from base chest (293, 72, -57)
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Base chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
    
    // Withdraw up to 64 cobblestone and 64 granite
    const stones = items.filter(i => ['cobblestone', 'granite', 'diorite', 'andesite', 'cobbled_deepslate'].includes(i.name));
    for (const st of stones) {
      if (lib.count('cobblestone') + lib.count('granite') + lib.count('diorite') >= 120) break;
      const take = Math.min(st.count, 64);
      await chest.withdraw(st.type, null, take);
      console.log(`Withdrew ${take} ${st.name}`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 2. Step outside door (294, 72, -54) and chop 1 log for sticks
try {
  await lib.goThroughDoor(294, 72, -54, { close: false });
  console.log('Outside base pos:', lib.fmt(bot.entity.position));
  
  const logBlock = bot.findBlocks({
    matching: b => b.name.endsWith('_log'),
    maxDistance: 15,
    count: 1
  })[0];

  if (logBlock) {
    console.log(`Chopping log at ${lib.fmt(logBlock)}...`);
    await lib.goTo(logBlock.x, logBlock.y, logBlock.z, 2);
    await lib.dig(logBlock.x, logBlock.y, logBlock.z);
    console.log('Mined log!');
  }
} catch (e) {
  console.log('Log note:', e.message);
}

// 3. Craft planks, sticks, 2 stone swords, 2 stone pickaxes
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem) {
  const ptype = logItem.name.replace('_log', '_planks');
  const pr = bot.recipesFor(mcData.itemsByName[ptype]?.id || mcData.itemsByName.oak_planks.id, null, 1, null)[0];
  if (pr) await bot.craft(pr, 1, null);
}
const plankItem = bot.inventory.items().find(i => i.name.endsWith('_planks'));
if (plankItem) {
  const sr = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (sr) await bot.craft(sr, 1, null);
  console.log(`Sticks crafted: ${lib.count('stick')}`);
}

const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (tableBlock && lib.count('stick') >= 2) {
  const swr = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, tableBlock)[0];
  if (swr) {
    await bot.craft(swr, 2, tableBlock);
    console.log('Crafted 2 stone swords!');
  }
  const pkr = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tableBlock)[0];
  if (pkr) {
    await bot.craft(pkr, 2, tableBlock);
    console.log('Crafted 2 stone pickaxes!');
  }
}

// 4. Enter Nether portal (299, 73, -54)
console.log('Entering Nether portal (299, 73, -54)...');
try {
  await lib.goTo(299, 73, -54, 0.5);
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
      console.log('Arrived in the Nether! Pos:', lib.fmt(bot.entity.position));
      break;
    }
  }
} catch (e) {
  console.log('Portal nav error:', e.message);
}

console.log(`Re-arm complete. Dim: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}, swords: ${lib.count('stone_sword')}, pickaxes: ${lib.count('stone_pickaxe')}`);
bot.chat(`beta: Fully re-armed! Carrying ${lib.count('stone_sword')} swords, ${lib.count('stone_pickaxe')} pickaxes, and ${lib.count('cobblestone')+lib.count('granite')} blocks. Advancing to Fortress!`);
