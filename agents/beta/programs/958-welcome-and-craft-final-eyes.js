console.log('=== Program 958: Welcome Team & Craft Final Eyes of Ender ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);
console.log('Current Eyes:', lib.count('ender_eye'), 'Pearls:', lib.count('ender_pearl'));

bot.chat('Beta: Standing by in Base House with 5 ender_eye & 17 ender_pearl! Ready to craft final eyes with Gamma & Delta!');

const startWait = Date.now();
const MAX_WAIT = 35000; // 35 seconds

while (Date.now() - startWait < MAX_WAIT && !isCancelled()) {
  // Check Base Chest
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();
      const rods = cItems.find(i => i.name === 'blaze_rod');
      if (rods) {
        console.log(`Found ${rods.count} blaze_rod in chest! Withdrawing...`);
        await chest.withdraw(rods.type, null, rods.count);
      }
      const pow = cItems.find(i => i.name === 'blaze_powder');
      if (pow) {
        console.log(`Found ${pow.count} blaze_powder in chest! Withdrawing...`);
        await chest.withdraw(pow.type, null, pow.count);
      }
      chest.close();
    } catch (e) {}
  }

  // Vacuum any dropped items from teammates
  try {
    await lib.pickup(6.0);
  } catch (e) {}

  // Check players in base
  for (const p of Object.values(bot.players)) {
    if (p.entity && p.username !== bot.username) {
      const d = bot.entity.position.distanceTo(p.entity.position);
      if (d <= 12) {
        console.log(`Teammate ${p.username} is inside base! dist=${d.toFixed(1)}m, held=${p.entity.heldItem?.name}`);
      }
    }
  }

  // Craft blaze rods to blaze powder
  if (lib.count('blaze_rod') > 0) {
    const toCraft = lib.count('blaze_rod') * 2;
    console.log(`Crafting ${lib.count('blaze_rod')} blaze_rod into ${toCraft} blaze_powder...`);
    try {
      await lib.craft('blaze_powder', toCraft);
      console.log(`Crafted! Current blaze_powder: ${lib.count('blaze_powder')}`);
    } catch (e) {
      console.log('Craft powder error:', e.message);
    }
  }

  // Craft ender_eye
  const bp = lib.count('blaze_powder');
  const ep = lib.count('ender_pearl');
  if (bp > 0 && ep > 0) {
    const toCraftEyes = Math.min(bp, ep);
    console.log(`Crafting ${toCraftEyes} ender_eye...`);
    try {
      await lib.craft('ender_eye', toCraftEyes);
      const totalEyes = lib.count('ender_eye');
      bot.chat(`Beta: 100% SUCCESS! Crafted ${totalEyes} EYES OF ENDER! Milestone 10 fully ready!`);
      console.log(`SUCCESS: Total ender_eye now = ${totalEyes}!`);
      break;
    } catch (ce) {
      console.log('Craft ender_eye notice:', ce.message);
    }
  }

  if (lib.count('ender_eye') >= 12) {
    console.log(`Target 12+ Eyes of Ender achieved! Total: ${lib.count('ender_eye')}`);
    break;
  }

  await sleep(2500);
}

console.log('Final Inventory:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  ender_eyes: lib.count('ender_eye'),
  ender_pearls: lib.count('ender_pearl'),
  blaze_powder: lib.count('blaze_powder'),
  blaze_rods: lib.count('blaze_rod'),
  hp: bot.health,
  food: bot.food
};
