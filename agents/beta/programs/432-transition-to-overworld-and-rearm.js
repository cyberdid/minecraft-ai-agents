// programs/432-transition-to-overworld-and-rearm.js
console.log('=== Step: Stand inside portal to transit to Overworld base, craft tools, return ===');
console.log('Current pos in Nether:', lib.fmt(bot.entity.position));

// 1. Move directly inside portal block (40.5, 65.0, -7.0)
await bot.lookAt(new Vec3(40.5, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(800);
bot.clearControlStates();

console.log('Standing in portal block at', lib.fmt(bot.entity.position));

// Wait up to 10s for dimension change
for (let i = 0; i < 10; i++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension === 'overworld' || bot.game.dimension === 'minecraft:overworld') {
    console.log('Transitioned to Overworld! Pos:', lib.fmt(bot.entity.position));
    break;
  }
}

// 2. In Overworld:
if (bot.game.dimension === 'overworld' || bot.game.dimension === 'minecraft:overworld') {
  // Step out of portal
  await sleep(1000);
  // Base chest is at (293, 72, -57)
  const cb = bot.blockAt(new Vec3(293, 72, -57));
  if (cb) {
    try {
      const chest = await bot.openChest(cb);
      const items = chest.containerItems();
      console.log('Overworld chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
      // Take sticks/wood/iron/food
      for (const it of items) {
        if (it.name.endsWith('_planks') || it.name.endsWith('_log') || it.name === 'stick' || it.name === 'iron_ingot' || it.name.includes('cooked')) {
          await chest.withdraw(it.type, null, it.count);
          console.log(`Withdrew ${it.name}x${it.count}`);
        }
      }
      chest.close();
    } catch (e) {}
  }

  // If we have wood/planks, craft sticks and stone swords/pickaxes
  if (lib.count('birch_log') > 0 || lib.count('oak_log') > 0) {
    const l = bot.inventory.items().find(i => i.name.endsWith('_log'));
    const ptype = l.name.replace('_log', '_planks');
    const pr = bot.recipesFor(mcData.itemsByName[ptype]?.id || mcData.itemsByName.oak_planks.id, null, 1, null)[0];
    if (pr) await bot.craft(pr, 1, null);
  }
  if (lib.count('birch_planks') > 0 || lib.count('oak_planks') > 0) {
    const sr = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
    if (sr) await bot.craft(sr, 1, null);
  }

  const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
  if (tableBlock && lib.count('stick') >= 2) {
    const swr = bot.recipesFor(mcData.itemsByName.stone_sword.id, null, 1, tableBlock)[0];
    if (swr) await bot.craft(swr, 2, tableBlock);
    const pkr = bot.recipesFor(mcData.itemsByName.stone_pickaxe.id, null, 1, tableBlock)[0];
    if (pkr) await bot.craft(pkr, 1, tableBlock);
    console.log('Crafted 2 stone swords & pickaxe!');
  }

  // Step back into portal at (299, 73, -54)
  console.log('Returning to Nether portal...');
  await lib.goTo(299, 73, -54, 0.2);
  for (let i = 0; i < 10; i++) {
    await sleep(1000);
    if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
      console.log('Back in Nether!');
      break;
    }
  }
}

console.log(`Pos: ${lib.fmt(bot.entity.position)}, Dim: ${bot.game.dimension}, Swords: ${lib.count('stone_sword')}`);
bot.chat(`beta: Ready! Dimension: ${bot.game.dimension}, Swords: ${lib.count('stone_sword')}, Cobble: ${lib.count('cobblestone')+lib.count('cobbled_deepslate')}. Advancing to Fortress!`);
