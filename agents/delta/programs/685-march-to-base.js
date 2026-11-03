console.log('=== PROGRAM 685: DELTA MARCH TO BASE & RETREAT ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

bot.chat('delta: Marching back to Overworld Base to prepare for Milestone 10 Eyes of Ender!');

// 1. Maintain golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// 2. Configure pathfinder to avoid fire and lava
if (bot.game.dimension === 'the_nether') {
  globalThis.configureFireAvoidance();
  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = false;
  moves.maxDropDown = 2;
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  bot.pathfinder.setMovements(moves);

  const returnWaypoints = [
    { x: 50, y: 65, z: -115 },
    { x: 61, y: 66, z: -100 },
    { x: 62, y: 67, z: -80 },
    { x: 61.5, y: 67, z: -70 },
    { x: 61.5, y: 67, z: -55 },
    { x: 63, y: 66, z: -35 },
    { x: 63, y: 65, z: -20 },
    { x: 63, y: 64, z: -7 },
    { x: 54, y: 65, z: -7 },
    { x: 46, y: 65, z: -7 }
  ];

  console.log(`Starting march across ${returnWaypoints.length} waypoints...`);

  for (let i = 0; i < returnWaypoints.length && !checkCancelled(); i++) {
    if (bot.game.dimension !== 'the_nether') break;

    await globalThis.clearFireAhead();

    const wp = returnWaypoints[i];
    const target = new Vec3(wp.x, wp.y, wp.z);

    // Keep gaze low (y=64) to avoid Enderman aggro
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

    console.log(`Advancing to WP ${i + 1}/${returnWaypoints.length} at (${wp.x}, ${wp.y}, ${wp.z})...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
    } catch (e) {
      try {
        await globalThis.clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.8));
      } catch (e2) {}
    }
  }

  // Find nearest nether portal block
  if (bot.game.dimension === 'the_nether' && !checkCancelled()) {
    console.log('Searching for Nether Portal...');
    const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
    if (portal) {
      console.log(`Found nether portal at ${lib.fmt(portal.position)}, stepping inside...`);
      try {
        await bot.pathfinder.goto(new goals.GoalNear(portal.position.x, portal.position.y, portal.position.z, 0.8));
      } catch (e) {
        await bot.lookAt(portal.position.offset(0.5, 0.5, 0.5), true);
        bot.setControlState('forward', true);
        await sleep(1500);
        bot.setControlState('forward', false);
      }

      console.log('Waiting for dimension warp to overworld...');
      const warpStart = Date.now();
      while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !checkCancelled()) {
        await sleep(300);
      }
    }
  }
}

// Check if now in Overworld (either via portal transit or respawn)
if (bot.game.dimension === 'overworld') {
  console.log('Now in OVERWORLD at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

  // If outside base, enter base house
  if (bot.entity.position.distanceTo(new Vec3(293.5, 72.0, -56.0)) > 3.0) {
    console.log('Walking to base door at (294, 72, -54)...');
    try {
      await lib.goToXZ(294, -53, { timeoutMs: 8000 });
      await lib.goThroughDoor(294, 72, -54);
    } catch (e) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 1.0));
      } catch (e2) {}
    }
  }

  // Inside base
  console.log('Inside base at:', lib.fmt(bot.entity.position));

  // Check night / sleep
  const time = bot.time.timeOfDay;
  console.log(`Time of day: ${time}`);
  if (time >= 12542 && time <= 23460) {
    console.log('Night time! Attempting to sleep in bed...');
    const beds = bot.findBlocks({
      matching: b => b && b.name.includes('bed'),
      maxDistance: 6
    });
    for (const bp of beds) {
      try {
        const bedBlock = bot.blockAt(bp);
        console.log(`Trying bed at ${lib.fmt(bp)}...`);
        await bot.sleep(bedBlock);
        console.log('Sleeping! Waiting for dawn...');
        await sleep(6000);
        break;
      } catch (err) {
        console.log(`Sleep error on bed at ${lib.fmt(bp)}:`, err.message);
      }
    }
  }

  // Check Base Chest for food
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock && bot.food < 18) {
    try {
      const chest = await bot.openContainer(chestBlock);
      const items = chest.containerItems();
      const foodItem = items.find(i => i.name.startsWith('cooked_') || i.name === 'bread' || i.name === 'apple' || i.name.includes('beef') || i.name.includes('porkchop'));
      if (foodItem) {
        console.log(`Withdrawing ${foodItem.name} x${Math.min(foodItem.count, 8)} from chest...`);
        await chest.withdraw(foodItem.type, null, Math.min(foodItem.count, 8));
      }
      chest.close();
    } catch (e) {
      console.log('Chest error:', e.message);
    }
  }

  // Eat food if available
  const invFood = bot.inventory.items().find(i => i.name.startsWith('cooked_') || i.name === 'bread' || i.name === 'apple' || i.name.includes('beef') || i.name.includes('porkchop'));
  if (invFood && bot.food < 19) {
    console.log(`Eating ${invFood.name}...`);
    try {
      await bot.equip(invFood.type, 'hand');
      await bot.consume();
    } catch (e) {}
  }

  bot.chat(`delta: Safely inside Overworld base! HP: ${bot.health.toFixed(1)}, Food: ${bot.food}, ready for Milestone 10!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
