console.log('=== Program 991: Await Gamma Reset & Craft Eyes ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Time:', bot.time.timeOfDay);
console.log('Holding:', lib.count('ender_eye'), 'ender_eye,', lib.count('ender_pearl'), 'ender_pearl');

bot.chat('Beta: Welcoming Gamma at Base Bed (294, 72, -55)! Crafting all Eyes of Ender!');

const chestPos = new Vec3(293, 72, -57);
const start = Date.now();
const MAX_WAIT = 50000;

while (Date.now() - start < MAX_WAIT && !isCancelled()) {
  // Pickup nearby drops
  try { await lib.pickup(6.0); } catch (e) {}

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

      const food = items.find(i => i.name.includes('cooked') || i.name === 'bread');
      if (food && bot.food < 18) {
        await chest.withdraw(food.type, null, Math.min(food.count, 6));
      }

      chest.close();
    } catch (e) {}
  }

  // Craft blaze_rod if any
  if (lib.count('blaze_rod') > 0) {
    try {
      const r = lib.count('blaze_rod');
      await lib.craft('blaze_powder', r * 2);
      console.log(`Crafted ${r * 2} blaze_powder!`);
    } catch (e) {}
  }

  // Craft ender_eye if possible
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
    console.log(`MILESTONE 10 EYE STACK READY! Holding ${lib.count('ender_eye')} Eyes of Ender!`);
    bot.chat(`Beta: Milestone 10 Eye Crafting COMPLETE! Holding ${lib.count('ender_eye')} Eyes of Ender! Ready to march to Stronghold (233, y, -98)!`);
    break;
  }

  // Eat food if acquired
  if (bot.food < 18) {
    try { await lib.eat(); } catch (e) {}
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

// Equip gear
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

return {
  eyes: lib.count('ender_eye'),
  pearls: lib.count('ender_pearl'),
  powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay
};
