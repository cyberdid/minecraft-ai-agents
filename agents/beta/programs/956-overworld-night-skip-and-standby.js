console.log('=== Program 956: Overworld Night Skip & Stronghold Prep ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);
console.log('Ender eyes:', lib.count('ender_eye'), 'Ender pearls:', lib.count('ender_pearl'));

// 1. Wait for sleep time if dusk
if (bot.time.timeOfDay < 12542) {
  const waitTicks = 12542 - bot.time.timeOfDay;
  console.log(`Waiting ${waitTicks} ticks until sleep time (12542)...`);
  await sleep(Math.min(12000, waitTicks * 50));
}

// 2. Sleep in bed to skip night
if (bot.time.timeOfDay >= 12541 && bot.time.timeOfDay <= 23460) {
  const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 5 });
  if (bed) {
    try {
      console.log(`Sleeping in bed at ${lib.fmt(bed.position)}...`);
      await bot.sleep(bed);
      console.log('Sleeping... waiting for dawn...');
      await sleep(5500);
      console.log('Woke up! New time:', bot.time.timeOfDay);
      bot.chat('Beta: Slept through the night! Overworld daytime restored!');
    } catch (e) {
      console.log('Sleep notice:', e.message);
    }
  }
}

// 3. Check Base Chest for Blaze Rods / Blaze Powder
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const cItems = chest.containerItems();
    console.log('Base Chest items:');
    for (const it of cItems) {
      if (['blaze_rod', 'blaze_powder', 'ender_eye', 'ender_pearl', 'iron_ingot'].includes(it.name)) {
        console.log(`  * ${it.name} x${it.count}`);
      }
    }

    const rods = cItems.find(i => i.name === 'blaze_rod');
    if (rods) {
      console.log(`Withdrawing ${rods.count} blaze_rod...`);
      await chest.withdraw(rods.type, null, rods.count);
    }

    const powder = cItems.find(i => i.name === 'blaze_powder');
    if (powder) {
      console.log(`Withdrawing ${powder.count} blaze_powder...`);
      await chest.withdraw(powder.type, null, powder.count);
    }

    chest.close();
  } catch (err) {
    console.log('Chest error:', err.message);
  }
}

// Craft blaze rods to blaze powder
if (lib.count('blaze_rod') > 0) {
  console.log(`Crafting ${lib.count('blaze_rod')} blaze rods into blaze powder...`);
  try {
    await lib.craft('blaze_powder', lib.count('blaze_rod') * 2);
  } catch (e) {}
}

// Craft ender_eye
const bp = lib.count('blaze_powder');
const ep = lib.count('ender_pearl');
if (bp > 0 && ep > 0) {
  const n = Math.min(bp, ep);
  console.log(`Crafting ${n} ender_eye...`);
  try {
    await lib.craft('ender_eye', n);
    bot.chat(`Beta: Crafted ${n} additional Eyes of Ender! Total held: ${lib.count('ender_eye')}!`);
    console.log(`Current ender_eye count: ${lib.count('ender_eye')}`);
  } catch (e) {
    console.log('lib.craft ender_eye notice:', e.message);
  }
}

console.log('Final Inventory:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  time: bot.time.timeOfDay,
  ender_eyes: lib.count('ender_eye'),
  ender_pearls: lib.count('ender_pearl'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
