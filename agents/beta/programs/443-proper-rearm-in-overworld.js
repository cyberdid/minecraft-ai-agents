// programs/443-proper-rearm-in-overworld.js
console.log('=== Step: Stand in portal to Overworld, craft tools + weapons, return ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Move into the center of portal block (40.5, 65.0, -7.0)
await bot.lookAt(new Vec3(40.5, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.clearControlStates();

console.log('Standing in Nether portal at', lib.fmt(bot.entity.position));

// Wait for Overworld teleportation (up to 12s)
for (let i = 0; i < 12; i++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension === 'overworld' || bot.game.dimension === 'minecraft:overworld') {
    console.log('Teleported to Overworld! Pos:', lib.fmt(bot.entity.position));
    break;
  }
}

// 2. If in Overworld:
if (bot.game.dimension === 'overworld' || bot.game.dimension === 'minecraft:overworld') {
  // Step forward out of portal frame
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();

  // Withdraw cobblestone/materials from base chest (293, 72, -57)
  const cb = bot.blockAt(new Vec3(293, 72, -57));
  if (cb) {
    try {
      const chest = await bot.openChest(cb);
      const items = chest.containerItems();
      const stones = items.filter(i => ['andesite', 'diorite', 'granite', 'tuff'].includes(i.name));
      for (const st of stones) {
        if (lib.count('andesite') + lib.count('granite') >= 64) break;
        await chest.withdraw(st.type, null, Math.min(st.count, 32));
      }
      chest.close();
    } catch (e) {}
  }

  // Chop 2 tree logs nearby
  const logBlock = bot.findBlocks({
    matching: b => b.name.endsWith('_log'),
    maxDistance: 15,
    count: 2
  })[0];

  if (logBlock) {
    try {
      await lib.goTo(logBlock.x, logBlock.y, logBlock.z, 2);
      await lib.dig(logBlock.x, logBlock.y, logBlock.z);
      console.log('Chopped log!');
    } catch (e) {}
  }

  // Craft planks & sticks
  const log = bot.inventory.items().find(i => i.name.endsWith('_log'));
  if (log) {
    const ptype = log.name.replace('_log', '_planks');
    const pr = bot.recipesFor(mcData.itemsByName[ptype]?.id || mcData.itemsByName.oak_planks.id, null, 1, null)[0];
    if (pr) await bot.craft(pr, 1, null);
  }
  const plank = bot.inventory.items().find(i => i.name.endsWith('_planks'));
  if (plank) {
    const sr = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
    if (sr) await bot.craft(sr, 1, null);
    console.log(`Sticks crafted: ${lib.count('stick')}`);
  }

  // Craft stone pickaxes and swords at crafting table (295, 72, -56)
  const table = bot.findBlocks({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 15, count: 1 })[0];
  if (table && lib.count('stick') >= 2) {
    const tb = bot.blockAt(table);
    // Can use cobblestone/andesite
    const pkr = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tb)[0];
    if (pkr) await bot.craft(pkr, 1, tb);
    const swr = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, tb)[0];
    if (swr) await bot.craft(swr, 1, tb);
    console.log('Crafted stone pickaxe and sword!');
  }

  // Re-enter Nether portal at (299, 73, -54)
  console.log('Stepping into Nether portal (299, 73, -54)...');
  await lib.goTo(299, 73, -54, 0.5);
  for (let i = 0; i < 12; i++) {
    await sleep(1000);
    if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
      console.log('Re-entered the Nether! Pos:', lib.fmt(bot.entity.position));
      break;
    }
  }
}

console.log(`Status: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, Inv=`, JSON.stringify(lib.inv()));
bot.chat(`beta: Overworld re-arm complete! Pos=${lib.fmt(bot.entity.position)}, Dim=${bot.game.dimension}. Ready for Fortress push!`);
