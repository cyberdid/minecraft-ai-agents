// programs/684-sleep-dawn-and-mine-gold.js
console.log('=== Program 684: Sleep Night Protocol & Gold Mining ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Ensure inside base house
if (bot.game.dimension === 'overworld') {
  if (bot.entity.position.distanceTo(new Vec3(293, 72, -55)) > 2.5) {
    try { await lib.goTo(294, 72, -52, 1.5, { timeoutMs: 6000 }); } catch (e) {}
  }
  if (bot.entity.position.z > -54.0) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  // Night Protocol: wait until tick 12542, then sleep
  let t = bot.time.timeOfDay;
  console.log(`Current timeOfDay: ${t}`);
  if (t < 12542 && t > 10000) {
    const waitTicks = 12542 - t;
    const waitMs = Math.min(waitTicks * 50, 45000);
    console.log(`Waiting ${Math.round(waitMs / 1000)}s for bedtime (tick 12542)...`);
    bot.chat(`alpha: Night approaching in ${Math.round(waitMs / 1000)}s. Waiting inside base house to sleep.`);
    await sleep(waitMs);
  }

  t = bot.time.timeOfDay;
  if (t >= 12542 && t < 23460) {
    console.log(`Bedtime reached (tick ${t})! Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Woke up! Time now:', bot.time.timeOfDay, 'HP:', bot.health, 'Food:', bot.food);
      bot.chat('alpha: Slept until dawn! Daylight restored.');
    } catch (e) {
      console.log('sleepInBed note:', e.message);
    }
  }

  // Check Base Chest for deposited gold
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const nug = chest.containerItems().find(i => i.name === 'gold_nugget');
      const ing = chest.containerItems().find(i => i.name === 'gold_ingot');
      if (nug) await chest.withdraw(nug.type, null, nug.count);
      if (ing) await chest.withdraw(ing.type, null, ing.count);
      await chest.close();
    } catch (e) {}
  }

  // Convert all nuggets to ingots
  if (lib.count('gold_nugget') >= 9) {
    const craftable = Math.floor(lib.count('gold_nugget') / 9);
    try {
      await lib.craft('gold_ingot', craftable);
      console.log(`Crafted ingots! Total gold_ingot: ${lib.count('gold_ingot')}`);
    } catch (e) {}
  }

  // If already 4+ ingots, craft boots right here!
  if (lib.count('gold_ingot') >= 4) {
    try {
      await lib.craft('golden_boots', 1);
      await lib.equipArmor();
      console.log('golden_boots crafted and equipped at base!');
      bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! Piglins are 100% neutral!');
    } catch (e) {}
  }
}

// 2. If still need gold ingots (< 4), enter Nether and mine 3-5 nether_gold_ore blocks
if (lib.count('golden_boots') === 0 && lib.count('gold_ingot') < 4) {
  console.log(`Holding ${lib.count('gold_ingot')} ingots. Entering Nether to mine remaining gold...`);
  await globalThis.enterNetherPortal();

  if (bot.game.dimension === 'the_nether') {
    globalThis.configureFireAvoidance();
    try { await lib.equipArmor(); } catch (e) {}
    try { await lib.equipWeapon(); } catch (e) {}

    // Move to safe ridge
    try {
      await lib.goTo(50, 65, -15, 2, { dig: false, timeoutMs: 10000 });
    } catch (e) {}

    // Scan for nether_gold_ore
    const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
    const ores = bot.findBlocks({ matching: goldOreId, maxDistance: 20, count: 10 })
      .map(p => bot.blockAt(p))
      .filter(Boolean)
      .filter(b => b.position.y >= 62 && b.position.y <= 72);

    console.log(`Found ${ores.length} safe gold ore blocks nearby!`);
    for (const ore of ores) {
      if (checkCancelled()) break;
      const totalEquiv = lib.count('gold_ingot') * 9 + lib.count('gold_nugget');
      if (totalEquiv >= 36) break;

      try {
        await lib.dig(ore.position.x, ore.position.y, ore.position.z);
        await lib.pickup(3.5);
      } catch (err) {}
    }

    try { await lib.pickup(4); } catch (e) {}

    // Craft ingots
    if (lib.count('gold_nugget') >= 9) {
      const craftable = Math.floor(lib.count('gold_nugget') / 9);
      try { await lib.craft('gold_ingot', craftable); } catch (e) {}
    }

    // Craft golden_boots
    if (lib.count('gold_ingot') >= 4) {
      try {
        await lib.craft('golden_boots', 1);
        await lib.equipArmor();
        bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! Piglins are 100% neutral!');
      } catch (e) {}
    }
  }
}

console.log('=== Program 684 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Armor:', bot.inventory.slots.slice(5, 9).map(s => s?.name), 'Inv:', lib.inv());
