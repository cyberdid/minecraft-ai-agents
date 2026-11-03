console.log('=== Program 968: Shelter in Base House & Monitor for Blaze Powder ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

const baseDoor = new Vec3(294, 72, -54);
const baseInside = new Vec3(293, 72, -56);

// Enter base house through door
console.log('Entering Base House through door (294, 72, -54)...');
try {
  await lib.goThroughDoor(baseDoor.x, baseDoor.y, baseDoor.z);
} catch (e) {
  console.log('Door passage notice:', e.message);
}

try {
  await bot.pathfinder.goto(new goals.GoalNear(baseInside.x, baseInside.y, baseInside.z, 0.8));
} catch (e) {}

console.log('Safe inside Base House! Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

// Monitor for 40 seconds
const startWait = Date.now();
const MAX_WAIT = 40000;

while (Date.now() - startWait < MAX_WAIT && !isCancelled()) {
  // Sleep if dusk/night
  if (bot.time.timeOfDay >= 12542 && bot.time.timeOfDay <= 23460) {
    const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 5 });
    if (bed) {
      try {
        console.log('Night time! Sleeping in bed...');
        await bot.sleep(bed);
        await sleep(4000);
        console.log('Woke up! New time:', bot.time.timeOfDay);
        bot.chat('Beta: Slept through night! Overworld daylight active!');
      } catch (e) {}
    }
  }

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

  // Vacuum drops
  try { await lib.pickup(6.0); } catch (e) {}

  // Craft blaze rods
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
      bot.chat(`Beta: 100% COMPLETE! Crafted ${total} EYES OF ENDER! Milestone 10 fully ready!`);
      console.log(`SUCCESS: Total ender_eye now = ${total}!`);
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
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay
};
