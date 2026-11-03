console.log('=== Program 988: Sleep Night & Receive Powder ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Time:', bot.time.timeOfDay);
console.log('Holding:', lib.count('ender_eye'), 'ender_eye,', lib.count('ender_pearl'), 'ender_pearl');

bot.chat('Gamma: If stuck, pillar 5 blocks and fall-reset! keepInventory is ON, you will respawn at base bed!');

const start = Date.now();
const MAX_WAIT = 50000;
const chestPos = new Vec3(293, 72, -57);

while (Date.now() - start < MAX_WAIT && !isCancelled()) {
  const tod = bot.time.timeOfDay;

  // Sleep if dusk/night
  if (tod >= 12542 && tod <= 23460 && !bot.isSleeping) {
    console.log(`Dusk/Night active (tod=${tod})! Going to bed...`);
    const bedBlock = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 5 });
    if (bedBlock) {
      try {
        await bot.sleep(bedBlock);
        console.log('Beta sleeping in bed...');
        while (bot.isSleeping && !isCancelled()) {
          await sleep(500);
        }
        console.log('Woke up! Time now:', bot.time.timeOfDay);
      } catch (err) {
        console.log('Sleep attempt info:', err.message);
      }
    }
  }

  // Vacuum nearby drops
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
