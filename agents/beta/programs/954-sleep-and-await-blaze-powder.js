console.log('=== Program 954: Sleep at Dusk & Monitor Base Chest ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);
console.log('Ender eyes held:', lib.count('ender_eye'), 'Pearls held:', lib.count('ender_pearl'));

// Wait until sleep time (12542) if dusk
if (bot.time.timeOfDay < 12542 && bot.time.timeOfDay >= 11500) {
  const waitTicks = 12542 - bot.time.timeOfDay;
  console.log(`Waiting ${waitTicks} ticks until sleep time...`);
  await sleep(Math.min(10000, waitTicks * 50));
}

// Sleep in bed
if (bot.time.timeOfDay >= 12542 && bot.time.timeOfDay <= 23460) {
  const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 5 });
  if (bed) {
    try {
      console.log(`Sleeping in bed at ${lib.fmt(bed.position)}...`);
      await bot.sleep(bed);
      console.log('Sleeping... waiting for dawn...');
      await sleep(5000);
      console.log('Woke up! New time:', bot.time.timeOfDay);
    } catch (e) {
      console.log('Sleep notice:', e.message);
    }
  }
}

// Inspect Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log('Base Chest items:');
    let foundPowder = 0;
    let foundRods = 0;
    for (const it of items) {
      if (['blaze_powder', 'blaze_rod', 'iron_ingot', 'cooked_mutton', 'cooked_beef'].includes(it.name)) {
        console.log(`  * ${it.name} x${it.count}`);
      }
      if (it.name === 'blaze_powder') foundPowder += it.count;
      if (it.name === 'blaze_rod') foundRods += it.count;
    }

    // If blaze rods found, withdraw to craft powder
    if (foundRods > 0) {
      const rodItem = items.find(i => i.name === 'blaze_rod');
      await chest.withdraw(rodItem.type, null, rodItem.count);
    }
    // If blaze powder found, withdraw
    if (foundPowder > 0) {
      const powItem = items.find(i => i.name === 'blaze_powder');
      await chest.withdraw(powItem.type, null, powItem.count);
    }

    chest.close();
  } catch (err) {
    console.log('Chest error:', err.message);
  }
}

// Craft blaze rods into blaze powder if holding rods
if (lib.count('blaze_rod') > 0) {
  try {
    await lib.craft('blaze_powder', lib.count('blaze_rod') * 2);
  } catch (e) {}
}

// Craft ender_eye if holding blaze powder and pearls
const bp = lib.count('blaze_powder');
const ep = lib.count('ender_pearl');
if (bp > 0 && ep > 0) {
  const n = Math.min(bp, ep);
  console.log(`Crafting ${n} ender_eye...`);
  try {
    await lib.craft('ender_eye', n);
    bot.chat(`Beta: Crafted ${n} additional Eyes of Ender! Total: ${lib.count('ender_eye')}`);
  } catch (e) {
    console.log('Craft error:', e.message);
  }
}

console.log('Final Inventory:', JSON.stringify(lib.inv()));
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
