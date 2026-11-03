console.log('=== Program 987: Collect Powder, Craft Eyes & March ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Time:', bot.time.timeOfDay);
console.log('Holding:', lib.count('ender_eye'), 'ender_eye,', lib.count('ender_pearl'), 'ender_pearl');

const chestPos = new Vec3(293, 72, -57);
const start = Date.now();
const MAX_WAIT = 50000; // 50s

while (Date.now() - start < MAX_WAIT && !isCancelled()) {
  // Check sleep if dusk/night
  const tod = bot.time.timeOfDay;
  if (tod >= 12542 && tod <= 23460) {
    const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
    if (bedBlock) {
      try {
        await bot.sleep(bedBlock);
        while (bot.isSleeping && !isCancelled()) await sleep(500);
      } catch (e) {}
    }
  }

  // Pickup dropped items
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
    bot.chat(`Beta: Milestone 10 Eye Crafting COMPLETE! Holding ${lib.count('ender_eye')} Eyes of Ender! Marching to Stronghold (233, y, -98)!`);
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

// Equip armor & weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

return {
  eyes: lib.count('ender_eye'),
  pearls: lib.count('ender_pearl'),
  powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position
};
