// programs/656-craft-powder-and-warp-home.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 656: CRAFT POWDER & TRANSIT TO BASE ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Rods:', lib.count('blaze_rod'));

// 1. Immediately craft all 11 blaze_rods into 22 blaze_powder!
const rods = lib.count('blaze_rod');
if (rods > 0) {
  console.log(`Crafting ${rods * 2} blaze_powder from ${rods} blaze_rods in player inventory...`);
  try {
    await lib.craft('blaze_powder', rods * 2);
    console.log(`SUCCESS! Blaze Powder crafted: ${lib.count('blaze_powder')}!`);
    bot.chat(`gamma: CRAFTED ${lib.count('blaze_powder')} BLAZE POWDER! Milestone 8 100% complete!`);
  } catch (ce) {
    console.log('Craft blaze_powder error:', ce.message);
  }
}

// 2. Safe waypoint transit to Portal Bunker
if (bot.game.dimension === 'the_nether') {
  globalThis.configureFireAvoidance();
  await globalThis.clearFireAhead();

  // WP 1: (54, 65, -7)
  console.log('Walking to WP 1: (54, 65, -7)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(54.0, 65.0, -7.0, 1.2));
  } catch (e1) {
    console.log('WP 1 goto error:', e1.message);
  }

  await globalThis.clearFireAhead();

  // WP 0: (46, 65, -7)
  console.log('Walking to WP 0: (46, 65, -7)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(46.0, 65.0, -7.0, 1.2));
  } catch (e2) {
    console.log('WP 0 goto error:', e2.message);
  }

  // Find nether_portal block
  let portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
  if (!portalBlock) {
    console.log('Searching portal at (40, 65, -7)...');
    try {
      await bot.pathfinder.goto(new goals.GoalNear(41.0, 65.0, -7.0, 1.5));
      portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
    } catch (e3) {}
  }

  if (portalBlock) {
    console.log(`Stepping into nether_portal at ${lib.fmt(portalBlock.position)}...`);
    await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(2500);
    bot.setControlState('forward', false);

    console.log('Waiting for dimension transfer to Overworld...');
    const warpStart = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
      await sleep(300);
    }
  } else {
    console.log('No portal block found! Checking (46.5, 66.0, 2.0)...');
    try {
      await bot.pathfinder.goto(new goals.GoalNear(46.5, 66.0, 2.0, 1.0));
      const pb2 = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
      if (pb2) {
        await bot.lookAt(pb2.position.offset(0.5, 0.5, 0.5), true);
        bot.setControlState('forward', true);
        await sleep(2500);
        bot.setControlState('forward', false);
      }
    } catch (e4) {}
  }
}

// 3. Overworld operations
if (bot.game.dimension === 'overworld') {
  console.log('ARRIVED IN OVERWORLD! Pos:', lib.fmt(bot.entity.position));
  bot.chat('gamma: Safely in Overworld! Bringing 22 Blaze Powder to Base House (293, 72, -55)!');

  // Walk into base house
  try {
    await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 15000 });
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }

  // Deposit in Base Chest (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      console.log('Opening Base Chest to deposit Blaze Powder...');
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();

      // Check if food
      const food = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
      if (food && bot.food < 18) {
        await chest.withdraw(food.type, null, Math.min(food.count, 6));
      }

      // Check if ender_pearls inside
      const epInChest = cItems.find(i => i.name === 'ender_pearl');
      if (epInChest) {
        console.log(`Withdrawing ${epInChest.count} ender_pearls to craft Eyes of Ender...`);
        await chest.withdraw(epInChest.type, null, epInChest.count);
      } else {
        // Deposit 16 blaze_powder for team
        const bpInInv = bot.inventory.items().find(i => i.name === 'blaze_powder');
        if (bpInInv && bpInInv.count >= 8) {
          console.log(`Depositing 16 blaze_powder into Base Chest...`);
          await chest.deposit(bpInInv.type, null, Math.min(16, bpInInv.count));
          bot.chat('gamma: Deposited 16 Blaze Powder in Base Chest (293, 72, -57) for team!');
        }
      }

      chest.close();
    } catch (ce) {
      console.log('Chest error:', ce.message);
    }
  }

  // Craft Eyes of Ender if we have both
  const bpCount = lib.count('blaze_powder');
  const epCount = lib.count('ender_pearl');
  if (bpCount > 0 && epCount > 0) {
    const toCraft = Math.min(bpCount, epCount);
    console.log(`Crafting ${toCraft} Eyes of Ender...`);
    try {
      await lib.craft('eye_of_ender', toCraft);
      console.log(`SUCCESS! Crafted ${toCraft} Eyes of Ender! Total held: ${lib.count('eye_of_ender')}`);
      bot.chat(`gamma: CRAFTED ${lib.count('eye_of_ender')} EYES OF ENDER! Stronghold expedition ready!`);
    } catch (err) {
      console.log('Craft eye_of_ender error:', err.message);
    }
  }

  // Equip best gear
  const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
  if (ib) try { await bot.equip(ib, 'feet'); } catch (e) {}
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
}

console.log(`=== END PROGRAM 656: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food} ===`);
console.log(`Inventory: Blaze Powder=${lib.count('blaze_powder')}, Eyes=${lib.count('eye_of_ender')}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  blaze_powder: lib.count('blaze_powder'),
  eyes: lib.count('eye_of_ender'),
  inv: lib.inv()
};
