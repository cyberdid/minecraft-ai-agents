// programs/682-heal-consolidate-gold.js
console.log('=== Program 682: Heal & Consolidate Gold for Milestone 9 ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. If in Nether, walk back to Nether portal bunker (41.5, 65, 2.5)
if (bot.game.dimension === 'the_nether') {
  console.log('Walking to return portal at (41.5, 65, 2.5)...');
  try {
    await lib.goTo(41.5, 65, 2.5, 1.5, { timeoutMs: 12000 });
  } catch (e) {
    try { await lib.goToXZ(41.5, 2.5, { timeoutMs: 8000 }); } catch (e2) {}
  }

  // Step into portal
  const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
  if (portal) {
    console.log('Found Nether portal, warping to Overworld...');
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

// 2. In Overworld: step into base house
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
  if (bot.entity.position.distanceTo(new Vec3(293, 72, -55)) > 4.0) {
    try { await lib.goTo(294, 72, -52, 2, { timeoutMs: 12000 }); } catch (e) {}
  }
  if (bot.entity.position.z > -54.0) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  // Sleep in bed if night to heal to full HP 20/20 & food 20/20!
  const t = bot.time.timeOfDay;
  if (t >= 12542 && t < 23460) {
    console.log('Night time! Sleeping in bed to reset HP & Food to 20/20...');
    try {
      await lib.sleepInBed();
      console.log('Woke up at dawn! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
    } catch (e) {}
  }

  // Deposit gold into Base Chest (293, 72, -57)
  const goldItems = {};
  if (lib.count('gold_ingot') > 0) goldItems.gold_ingot = 'all';
  if (lib.count('gold_nugget') > 0) goldItems.gold_nugget = 'all';

  if (Object.keys(goldItems).length > 0) {
    console.log('Depositing gold into Base Chest:', goldItems);
    try {
      await lib.deposit(goldItems, 293, 72, -57);
      console.log('Gold deposited successfully!');
    } catch (e) {
      console.log('Deposit note:', e.message);
    }
  }

  // Inspect Base Chest
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const items = chest.containerItems().map(i => `${i.name}x${i.count}`).join(', ');
      console.log('Base Chest now contains:', items);
      bot.chat(`alpha: Base Chest contains: ${items}`);
      await chest.close();
    } catch (e) {}
  }
}

console.log('=== Program 682 Finished ===');
console.log('Status: Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());
