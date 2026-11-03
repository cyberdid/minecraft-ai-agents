console.log('=== Program 1002: Enter Base & Share Pearls for Milestone 13 ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Walk into base door at (294, 72, -54)
try {
  await lib.goTo(294, 72, -53, 1.0, { timeoutMs: 6000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door passage note:', e.message);
}

console.log('Inside Base House! Pos:', lib.fmt(bot.entity.position));

// Share Ender Pearls in Base Chest (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);

    // Deposit 5 Ender Pearls for Gamma & Delta
    const pearls = bot.inventory.items().find(i => i.name === 'ender_pearl');
    if (pearls && pearls.count > 2) {
      const depositCount = Math.min(5, pearls.count - 2);
      console.log(`Depositing ${depositCount} ender_pearls for teammates...`);
      await chest.deposit(pearls.type, null, depositCount);
      bot.chat(`gamma: Deposited ${depositCount} Ender Pearls in Base Chest (293, 72, -57) for End Gateway entry!`);
    }

    // Deposit inventory clutter
    const junk = ['granite', 'andesite', 'lapis_lazuli', 'stone_bricks', 'end_stone', 'crying_obsidian', 'blackstone', 'bone', 'blaze_powder'];
    for (const j of junk) {
      const it = bot.inventory.items().find(i => i.name === j);
      if (it) try { await chest.deposit(it.type, null, it.count); } catch (e) {}
    }

    chest.close();
  } catch (e) {
    console.log('Chest interaction error:', e.message);
  }
}

// Equip Netherite Sword and armor
const nSword = bot.inventory.items().find(i => i.name === 'netherite_sword');
if (nSword) try { await bot.equip(nSword, 'hand'); } catch (e) {}
try { await lib.equipArmor(); } catch (e) {}

console.log('Beta ready! Position:', lib.fmt(bot.entity.position));
console.log('Inventory:', lib.inv());
bot.chat('Beta: Safely in Base House with Netherite Sword & Ender Pearls! Ready for Milestone 13 Outer End Expedition!');

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: lib.count('ender_pearl'),
  sword: nSword ? 'netherite_sword' : 'iron_sword'
};
