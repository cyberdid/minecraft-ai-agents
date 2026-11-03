console.log('=== Program 985: Check All & Craft ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);
console.log('Holding:', lib.count('ender_eye'), 'ender_eye,', lib.count('ender_pearl'), 'ender_pearl');

// Check all players
for (const p of Object.values(bot.entities).filter(e => e.type === 'player')) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, held=${p.heldItem ? p.heldItem.name : 'null'}`);
}

// Pickup items
try { await lib.pickup(5.0); } catch (e) {}

// Check Base Chest (293, 72, -57)
const cb = bot.blockAt(new Vec3(293, 72, -57));
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
  } catch (e) {
    console.log('Chest error:', e.message);
  }
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
console.log(`Ingredients check: blaze_powder=${powCount}, ender_pearl=${pearlCount}`);

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

return {
  eyes: lib.count('ender_eye'),
  pearls: lib.count('ender_pearl'),
  powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position
};
