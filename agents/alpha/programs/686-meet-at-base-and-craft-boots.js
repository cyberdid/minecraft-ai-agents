// programs/686-meet-at-base-and-craft-boots.js
console.log('=== Program 686: Return to Base, Regear & Craft Golden Boots ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Walk back to Nether Portal (40, 65, -7) / (41.5, 65, 2.5)
if (bot.game.dimension === 'the_nether') {
  globalThis.configureFireAvoidance();
  console.log('Walking to Nether return portal at (40, 65, -7)...');
  try {
    await lib.goTo(40, 65, -7, 2, { timeoutMs: 12000 });
  } catch (e) {
    try { await lib.goToXZ(40, -7, { timeoutMs: 8000 }); } catch (e2) {}
  }

  const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
  if (portal) {
    console.log('Entering Nether Portal to Overworld...');
    await bot.lookAt(portal.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.setControlState('forward', false);

    const start = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - start < 25000 && !checkCancelled()) {
      await sleep(300);
    }
  }
}

// 2. In Overworld: enter base house (293, 72, -55)
if (bot.game.dimension === 'overworld') {
  console.log('Arrived in Overworld! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
  if (bot.entity.position.distanceTo(new Vec3(293, 72, -55)) > 3.0) {
    try { await lib.goTo(294, 72, -52, 2, { timeoutMs: 10000 }); } catch (e) {}
  }
  if (bot.entity.position.z > -54.0) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  // Check Base Chest
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const ing = chest.containerItems().find(i => i.name === 'gold_ingot');
      const nug = chest.containerItems().find(i => i.name === 'gold_nugget');
      const boots = chest.containerItems().find(i => i.name === 'golden_boots');
      if (boots) await chest.withdraw(boots.type, null, 1);
      if (ing) await chest.withdraw(ing.type, null, ing.count);
      if (nug) await chest.withdraw(nug.type, null, nug.count);
      await chest.close();
    } catch (e) {}
  }

  // Craft ingots from nuggets
  if (lib.count('gold_nugget') >= 9) {
    const craftable = Math.floor(lib.count('gold_nugget') / 9);
    try { await lib.craft('gold_ingot', craftable); } catch (e) {}
  }

  // Craft golden_boots if 4+ ingots
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    console.log('Crafting golden_boots...');
    try {
      await lib.craft('golden_boots', 1);
      console.log('golden_boots crafted!');
    } catch (e) {}
  }

  // Equip armor
  try { await lib.equipArmor(); } catch (e) {}
  console.log('Armor worn:', bot.inventory.slots.slice(5, 9).map(s => s?.name));

  if (bot.inventory.slots[8]?.name === 'golden_boots') {
    bot.chat('alpha: [SUIT UP] golden_boots equipped! Piglins are 100% neutral! Ready for Ender Pearl bartering!');
  } else {
    bot.chat(`alpha: Gold status: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets. Need 4 ingots for golden_boots.`);
  }

  // Check if night to sleep
  const t = bot.time.timeOfDay;
  if (t >= 12542 && t < 23460) {
    try { await lib.sleepInBed(); } catch (e) {}
  }
}

console.log('=== Program 686 Complete ===');
console.log('Status: Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());
