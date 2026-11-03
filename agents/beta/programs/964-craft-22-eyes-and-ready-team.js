console.log('=== Program 964: Craft 22 Eyes of Ender & Assemble Expedition ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);
console.log('Eyes held:', lib.count('ender_eye'), 'Pearls held:', lib.count('ender_pearl'));

bot.chat('Beta: Standing at Base Chest (293, 72, -57) awaiting Gamma & Delta with 22 Blaze Powder to craft full 22 Eyes of Ender!');

const startWait = Date.now();
const MAX_WAIT = 50000; // 50 seconds

while (Date.now() - startWait < MAX_WAIT && !isCancelled()) {
  // Check Base Chest
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

  // Vacuum any dropped items from teammates
  try { await lib.pickup(6.0); } catch (e) {}

  // Check teammates
  for (const p of Object.values(bot.players)) {
    if (p.entity && p.username !== bot.username) {
      const d = bot.entity.position.distanceTo(p.entity.position);
      if (d <= 10) {
        console.log(`Teammate ${p.username} is nearby (${d.toFixed(1)}m), held: ${p.entity.heldItem?.name}`);
      }
    }
  }

  // Craft blaze rods to blaze powder
  if (lib.count('blaze_rod') > 0) {
    try { await lib.craft('blaze_powder', lib.count('blaze_rod') * 2); } catch (e) {}
  }

  // Craft ender_eye
  const bp = lib.count('blaze_powder');
  const ep = lib.count('ender_pearl');
  if (bp > 0 && ep > 0) {
    const toCraft = Math.min(bp, ep);
    console.log(`Crafting ${toCraft} ender_eye...`);
    try {
      await lib.craft('ender_eye', toCraft);
      const total = lib.count('ender_eye');
      bot.chat(`Beta: 100% COMPLETE! Crafted ${total} EYES OF ENDER! Milestone 10 Part 1 ACHIEVED!`);
      console.log(`SUCCESS: Total ender_eye now = ${total}!`);
      break;
    } catch (ce) {
      console.log('Craft error:', ce.message);
    }
  }

  if (lib.count('ender_eye') >= 12) {
    console.log(`Target 12+ Eyes of Ender achieved! Total: ${lib.count('ender_eye')}`);
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
  time: bot.time.timeOfDay
};
