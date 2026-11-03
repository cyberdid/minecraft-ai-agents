console.log('=== Program 940: Enter Portal to Base & Craft Eyes of Ender ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. If in Nether, walk the final stretch to the portal
if (bot.game.dimension === 'the_nether') {
  const finalWaypoints = [
    { x: 54, y: 65, z: -7 },
    { x: 46, y: 65, z: -7 }
  ];

  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = false;
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  bot.pathfinder.setMovements(moves);

  for (const wp of finalWaypoints) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
    } catch (e) {
      console.log(`Pathfind to ${wp.x}, ${wp.y}, ${wp.z} error:`, e.message);
    }
  }

  // Find active nether_portal block
  let portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
  if (!portal) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(46, 66, 2, 2.5));
      portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
    } catch (e) {}
  }

  if (portal) {
    console.log(`Stepping into nether_portal at ${lib.fmt(portal.position)}...`);
    await bot.lookAt(portal.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(2000);
    bot.setControlState('forward', false);

    console.log('Waiting for dimension change to overworld...');
    const startWarp = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - startWarp < 25000 && !isCancelled()) {
      await sleep(300);
    }
  } else {
    console.log('Could not find active portal block within 16m!');
  }
}

// 2. In Overworld: walk into base house to chest and crafting table
if (bot.game.dimension === 'overworld') {
  bot.chat('Beta: Arrived in Overworld Base! Moving to Base Chest (293, 72, -57) to craft Eyes of Ender!');
  console.log('Overworld position:', lib.fmt(bot.entity.position));

  // If outside house door, enter through door
  if (bot.entity.position.z > -54.0) {
    try {
      await lib.goThroughDoor(294, 72, -54);
    } catch (e) {
      console.log('Door passage error:', e.message);
    }
  }

  try {
    await lib.goTo(293, 72, -56, 1.2, { timeoutMs: 10000 });
  } catch (e) {
    console.log('Goto base interior error:', e.message);
  }

  // Open Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    console.log('Opening Base Chest at (293, 72, -57)...');
    try {
      const chest = await bot.openChest(chestBlock);
      const itemsInChest = chest.containerItems();
      console.log('Chest items:', itemsInChest.map(i => `${i.name}x${i.count}`).join(', '));

      // Withdraw blaze_powder
      const powder = itemsInChest.find(i => i.name === 'blaze_powder');
      if (powder) {
        console.log(`Withdrawing ${powder.count} blaze_powder...`);
        await chest.withdraw(powder.type, null, powder.count);
      }

      // Also withdraw any cooked food if available
      const foodItem = itemsInChest.find(i => ['cooked_mutton', 'cooked_beef', 'cooked_porkchop', 'bread'].includes(i.name));
      if (foodItem) {
        console.log(`Withdrawing ${foodItem.count} ${foodItem.name}...`);
        await chest.withdraw(foodItem.type, null, Math.min(16, foodItem.count));
      }

      chest.close();
    } catch (err) {
      console.log('Chest interaction error:', err.message);
    }
  }

  // Eat food if available to restore health
  const foodInInv = bot.inventory.items().find(i => ['cooked_mutton', 'cooked_beef', 'cooked_porkchop', 'bread'].includes(i.name));
  if (foodInInv) {
    console.log(`Eating ${foodInInv.name}...`);
    try {
      await bot.equip(foodInInv, 'hand');
      await bot.consume();
    } catch (e) {}
  }

  // 3. Craft Eyes of Ender
  const powderCount = lib.count('blaze_powder');
  const pearlCount = lib.count('ender_pearl');
  console.log(`Crafting resources: ${powderCount} blaze_powder, ${pearlCount} ender_pearl`);

  const eyesToCraft = Math.min(powderCount, pearlCount);
  if (eyesToCraft > 0) {
    console.log(`Crafting ${eyesToCraft} eye_of_ender...`);
    try {
      await lib.craft('eye_of_ender', eyesToCraft);
      bot.chat(`Beta: CRAFTED ${lib.count('eye_of_ender')} EYES OF ENDER! Milestone 10 Stronghold Triangulation ready!`);
      console.log(`Crafted! Current eye_of_ender count: ${lib.count('eye_of_ender')}`);
    } catch (craftErr) {
      console.log('Craft eye_of_ender error:', craftErr.message);
    }
  }
}

console.log('Final Status: Dim =', bot.game.dimension, 'Pos =', lib.fmt(bot.entity.position), 'Inv =', JSON.stringify(lib.inv()));
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  eyes: lib.count('eye_of_ender'),
  pearls: lib.count('ender_pearl'),
  powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food
};
