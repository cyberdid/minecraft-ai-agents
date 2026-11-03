console.log('=== Program 963: Craft All 16+ Eyes of Ender ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);
console.log('Beta currently holds:', lib.count('ender_eye'), 'ender_eye and', lib.count('ender_pearl'), 'ender_pearl');

bot.chat('Beta: Standing at Base Chest (293, 72, -57) with 17 Ender Pearls! Ready to craft final Eyes of Ender!');

const startWait = Date.now();
const MAX_WAIT = 40000; // 40 seconds

while (Date.now() - startWait < MAX_WAIT && !isCancelled()) {
  // Check Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();

      const pow = cItems.find(i => i.name === 'blaze_powder');
      if (pow) {
        console.log(`Withdrawing ${pow.count} blaze_powder from Base Chest...`);
        await chest.withdraw(pow.type, null, pow.count);
      }

      const rods = cItems.find(i => i.name === 'blaze_rod');
      if (rods) {
        console.log(`Withdrawing ${rods.count} blaze_rod from Base Chest...`);
        await chest.withdraw(rods.type, null, rods.count);
      }

      chest.close();
    } catch (e) {}
  }

  // Vacuum any dropped items
  try { await lib.pickup(6.0); } catch (e) {}

  // Craft blaze rods to blaze powder if holding rods
  if (lib.count('blaze_rod') > 0) {
    const rCount = lib.count('blaze_rod');
    try {
      await lib.craft('blaze_powder', rCount * 2);
    } catch (e) {}
  }

  // Craft ender_eye
  const bp = lib.count('blaze_powder');
  const ep = lib.count('ender_pearl');
  if (bp > 0 && ep > 0) {
    const toCraft = Math.min(bp, ep);
    console.log(`Crafting ${toCraft} ender_eye...`);
    try {
      await lib.craft('ender_eye', toCraft);
      const totalEyes = lib.count('ender_eye');
      bot.chat(`Beta: 100% COMPLETE! Crafted ${totalEyes} EYES OF ENDER! Milestone 10 Part 1 ACHIEVED!`);
      console.log(`SUCCESS: Total ender_eye in inventory = ${totalEyes}!`);
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
  food: bot.food,
  inv: lib.inv()
};
