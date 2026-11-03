// programs/646-march-to-overworld.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 646: RETREAT TO OVERWORLD & ADVANCE MILESTONE 10 ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

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

// 2. Safe movement configuration
globalThis.configureFireAvoidance();

// Safe return waypoints from Bunker (z=-127) back to Portal (z=2)
const RETURN_WAYPOINTS = [
  { x: 44.0, y: 65.0, z: -127.0 },
  { x: 50.0, y: 65.0, z: -115.0 },
  { x: 61.0, y: 66.0, z: -100.0 },
  { x: 62.0, y: 67.0, z: -80.0 },
  { x: 61.5, y: 67.0, z: -70.0 },
  { x: 61.5, y: 67.0, z: -60.0 },
  { x: 61.5, y: 67.0, z: -55.0 },
  { x: 62.0, y: 67.0, z: -50.0 },
  { x: 63.0, y: 66.0, z: -35.0 },
  { x: 63.0, y: 65.0, z: -20.0 },
  { x: 63.0, y: 64.0, z: -7.0 },
  { x: 54.0, y: 65.0, z: -7.0 },
  { x: 46.0, y: 65.0, z: -7.0 },
  { x: 46.5, y: 66.0, z: 2.0 } // Portal frame
];

if (bot.game.dimension === 'the_nether') {
  bot.chat('gamma: Marching safe East Ridge trail back to Nether Portal for Milestone 10!');

  // Find nearest starting waypoint
  let startIdx = 0;
  let minDist = Infinity;
  for (let i = 0; i < RETURN_WAYPOINTS.length; i++) {
    const d = bot.entity.position.distanceTo(new Vec3(RETURN_WAYPOINTS[i].x, RETURN_WAYPOINTS[i].y, RETURN_WAYPOINTS[i].z));
    if (d < minDist) {
      minDist = d;
      startIdx = i;
    }
  }

  console.log(`Starting return march from waypoint ${startIdx}/${RETURN_WAYPOINTS.length} (dist: ${minDist.toFixed(1)}m)...`);

  for (let i = startIdx; i < RETURN_WAYPOINTS.length && !isCancelled(); i++) {
    if (bot.game.dimension !== 'the_nether') break;

    await globalThis.clearFireAhead();

    const wp = RETURN_WAYPOINTS[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 1.8) continue;

    // Look low to avoid Enderman gaze
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.2));
    } catch (e) {
      try {
        await globalThis.clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
      } catch (e2) {}
    }

    await globalThis.clearFireAhead();
  }

  // 3. Step into Nether Portal
  console.log('Searching for nether_portal block near Portal Camp...');
  let portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
  if (portalBlock) {
    console.log(`Entering portal at ${lib.fmt(portalBlock.position)}...`);
    await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(2000);
    bot.setControlState('forward', false);

    console.log('Waiting for dimension transfer to overworld...');
    const warpStart = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
      await sleep(300);
    }
  } else {
    console.log('No portal block found within 16m! Checking (46, 66, 2)...');
    try {
      await bot.pathfinder.goto(new goals.GoalNear(46.5, 66.0, 2.0, 1.0));
    } catch (e) {}
  }
}

// 4. Overworld operations
if (bot.game.dimension === 'overworld') {
  console.log('Arrived in OVERWORLD! Pos:', lib.fmt(bot.entity.position));
  bot.chat('gamma: Successfully arrived in Overworld! Heading to Base House (293, 72, -55)...');

  // Go to base house
  try {
    await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 15000 });
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }

  // Check if night or low HP to sleep
  const time = bot.time.timeOfDay;
  console.log(`Current Overworld time: ${time}, HP: ${bot.health}`);
  if (time >= 12542 && time <= 23460) {
    console.log('Night time! Sleeping in Bed 1 at (294, 72, -55)...');
    try {
      const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
      if (bed) {
        await bot.sleep(bed);
        await sleep(5000);
      }
    } catch (be) {
      console.log('Sleep error:', be.message);
    }
  }

  // Inspect Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock && chestBlock.name.includes('chest')) {
    console.log('Opening Base Chest at (293, 72, -57)...');
    try {
      const chest = await bot.openChest(chestBlock);
      const items = chest.containerItems();
      console.log(`Base Chest contains ${items.length} item stacks:`);
      for (const it of items) {
        console.log(`  - ${it.name} x${it.count}`);
      }

      // Check if food inside to eat
      const chestFoods = items.filter(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
      if (chestFoods.length > 0 && bot.food < 18) {
        console.log(`Withdrawing ${chestFoods[0].name} x4 to eat...`);
        await chest.withdraw(chestFoods[0].type, null, Math.min(chestFoods[0].count, 4));
      }

      // Check if blaze_powder in chest
      const bp = items.find(i => i.name === 'blaze_powder');
      const ep = items.find(i => i.name === 'ender_pearl') || bot.inventory.items().find(i => i.name === 'ender_pearl');

      if (bp) {
        console.log(`Chest has ${bp.count} blaze_powder!`);
      }

      chest.close();
    } catch (ce) {
      console.log('Chest interaction error:', ce.message);
    }
  }

  // Eat if we have food
  const foods = ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'];
  for (const f of foods) {
    if (lib.count(f) > 0 && bot.food < 18) {
      try { await lib.eat(); } catch (e) {}
    }
  }

  // Equip full iron gear if available
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
}

console.log(`=== END PROGRAM 646: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food} ===`);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: lib.count('ender_pearl'),
  blaze_powder: lib.count('blaze_powder'),
  eyes: lib.count('eye_of_ender'),
  inv: lib.inv()
};
