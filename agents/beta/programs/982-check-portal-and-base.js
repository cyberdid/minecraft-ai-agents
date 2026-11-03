console.log('=== Program 982: Check Portal & Base ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Time:', bot.time.timeOfDay);

// Check all players
for (const p of Object.values(bot.entities).filter(e => e.type === 'player')) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, held=${p.heldItem ? p.heldItem.name : 'null'}`);
}

// Pickup drops outside
try { await lib.pickup(5.0); } catch (e) {}

// Walk into base house through door
console.log('Entering base house through door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor error:', e.message);
}

// Check inside Base House
console.log('Inside base house at:', lib.fmt(bot.entity.position));

const chestPos = new Vec3(293, 72, -57);
const start = Date.now();
const MAX_WAIT = 25000;

while (Date.now() - start < MAX_WAIT && !isCancelled()) {
  try { await lib.pickup(5.0); } catch (e) {}

  const cb = bot.blockAt(chestPos);
  if (cb) {
    try {
      const chest = await bot.openChest(cb);
      const items = chest.containerItems();

      const pow = items.find(i => i.name === 'blaze_powder');
      if (pow) {
        console.log(`FOUND ${pow.count} BLAZE POWDER IN CHEST! Withdrawing...`);
        await chest.withdraw(pow.type, null, pow.count);
      }

      const rods = items.find(i => i.name === 'blaze_rod');
      if (rods) {
        console.log(`FOUND ${rods.count} BLAZE RODS IN CHEST! Withdrawing...`);
        await chest.withdraw(rods.type, null, rods.count);
      }

      chest.close();
    } catch (e) {}
  }

  // Craft blaze_rod if any
  if (lib.count('blaze_rod') > 0) {
    try {
      await lib.craft('blaze_powder', lib.count('blaze_rod') * 2);
    } catch (e) {}
  }

  // Craft ender_eye if possible
  const powCount = lib.count('blaze_powder');
  const pearlCount = lib.count('ender_pearl');
  if (powCount > 0 && pearlCount > 0) {
    const toCraft = Math.min(powCount, pearlCount);
    try {
      await lib.craft('ender_eye', toCraft);
      console.log(`CRAFTED ${toCraft} ender_eye! Total held: ${lib.count('ender_eye')}`);
      bot.chat(`Beta: Crafted ${toCraft} Eyes of Ender! Total held: ${lib.count('ender_eye')}!`);
    } catch (e) {
      console.log('Craft error:', e.message);
    }
  }

  if (lib.count('ender_eye') >= 12) break;

  await sleep(1500);
}

return {
  eyes: lib.count('ender_eye'),
  pearls: lib.count('ender_pearl'),
  powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position
};
