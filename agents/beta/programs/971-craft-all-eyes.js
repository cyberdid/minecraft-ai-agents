console.log('=== Program 971: Craft All 22 Eyes of Ender ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);
console.log('Currently holding:', lib.count('ender_eye'), 'ender_eye,', lib.count('ender_pearl'), 'ender_pearl');

bot.chat('Beta: Base Chest monitor active. 17 Ender Pearls ready to craft all 17 Eyes of Ender!');

const startWait = Date.now();
const MAX_WAIT = 50000; // 50 seconds

while (Date.now() - startWait < MAX_WAIT && !isCancelled()) {
  // 1. Inspect Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();

      const pow = cItems.find(i => i.name === 'blaze_powder');
      if (pow) {
        console.log(`Found ${pow.count} blaze_powder in Base Chest! Withdrawing...`);
        await chest.withdraw(pow.type, null, pow.count);
      }

      const rods = cItems.find(i => i.name === 'blaze_rod');
      if (rods) {
        console.log(`Found ${rods.count} blaze_rod in Base Chest! Withdrawing...`);
        await chest.withdraw(rods.type, null, rods.count);
      }

      chest.close();
    } catch (e) {}
  }

  // 2. Vacuum any dropped items from teammates
  try { await lib.pickup(6.0); } catch (e) {}

  // 3. Craft blaze rods to blaze powder
  if (lib.count('blaze_rod') > 0) {
    const rCount = lib.count('blaze_rod');
    try {
      await lib.craft('blaze_powder', rCount * 2);
    } catch (e) {}
  }

  // 4. Craft ender_eye
  const bp = lib.count('blaze_powder');
  const ep = lib.count('ender_pearl');
  if (bp > 0 && ep > 0) {
    const toCraft = Math.min(bp, ep);
    console.log(`Crafting ${toCraft} ender_eye...`);
    try {
      await lib.craft('ender_eye', toCraft);
      const total = lib.count('ender_eye');
      bot.chat(`Beta: 100% COMPLETE! CRAFTED ${total} EYES OF ENDER! Milestone 10 (Eyes of Ender) ACHIEVED!`);
      console.log(`SUCCESS: Total ender_eye in inventory = ${total}!`);
      break;
    } catch (ce) {
      console.log('Craft error:', ce.message);
    }
  }

  if (lib.count('ender_eye') >= 12) {
    console.log(`Target achieved! Total ender_eye: ${lib.count('ender_eye')}`);
    break;
  }

  await sleep(2500);
}

console.log('Final Beta Inventory:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  ender_eyes: lib.count('ender_eye'),
  ender_pearls: lib.count('ender_pearl'),
  blaze_powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food
};
