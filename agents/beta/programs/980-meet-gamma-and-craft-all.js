console.log('=== Program 980: Meet Gamma & Craft All Eyes of Ender ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Time:', bot.time.timeOfDay);
console.log('Holding:', lib.count('ender_eye'), 'ender_eye,', lib.count('ender_pearl'), 'ender_pearl');

bot.chat('Beta: In Base House with 17 Ender Pearls ready to combine with Gamma Blaze Powder!');

const start = Date.now();
const MAX_TIME = 45000;
const chestPos = new Vec3(293, 72, -57);

while (Date.now() - start < MAX_TIME && !isCancelled()) {
  // Check ground items in base
  try { await lib.pickup(5.0); } catch (e) {}

  // Check Base Chest
  const cb = bot.blockAt(chestPos);
  if (cb) {
    try {
      const chest = await bot.openChest(cb);
      const items = chest.containerItems();

      const pow = items.find(i => i.name === 'blaze_powder');
      if (pow) {
        console.log(`FOUND ${pow.count} BLAZE POWDER IN BASE CHEST! Withdrawing...`);
        await chest.withdraw(pow.type, null, pow.count);
      }

      const rods = items.find(i => i.name === 'blaze_rod');
      if (rods) {
        console.log(`FOUND ${rods.count} BLAZE RODS IN BASE CHEST! Withdrawing...`);
        await chest.withdraw(rods.type, null, rods.count);
      }

      chest.close();
    } catch (e) {}
  }

  // If we have blaze_rod, craft to powder
  if (lib.count('blaze_rod') > 0) {
    try {
      const r = lib.count('blaze_rod');
      await lib.craft('blaze_powder', r * 2);
      console.log(`Crafted ${r * 2} blaze_powder from blaze_rod!`);
    } catch (e) {
      console.log('Craft blaze_powder error:', e.message);
    }
  }

  // If we have blaze_powder, craft ender_eye
  const powCount = lib.count('blaze_powder');
  const pearlCount = lib.count('ender_pearl');
  if (powCount > 0 && pearlCount > 0) {
    const toCraft = Math.min(powCount, pearlCount);
    console.log(`Crafting ${toCraft} ender_eye...`);
    try {
      await lib.craft('ender_eye', toCraft);
      console.log(`SUCCESS! Crafted ${toCraft} ender_eye! Total held: ${lib.count('ender_eye')}`);
      bot.chat(`Beta: CRAFTED ${toCraft} EYES OF ENDER! Total held: ${lib.count('ender_eye')}!`);
    } catch (e) {
      console.log('Craft ender_eye error:', e.message);
    }
  }

  if (lib.count('ender_eye') >= 12) {
    console.log(`STRONGHOLD EXPEDITION READY! ${lib.count('ender_eye')} Eyes of Ender in inventory!`);
    break;
  }

  // Check teammates
  for (const name of ['gamma', 'alpha', 'delta']) {
    const p = bot.players[name];
    if (p && p.entity) {
      console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
    }
  }

  await sleep(1500);
}

return {
  eyes: lib.count('ender_eye'),
  pearls: lib.count('ender_pearl'),
  powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay
};
