// programs/794-respawn-and-reunite-bunker.js
console.log('=== Program 794: Respawn, Warp, and Safe March to Fortress Bunker ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. If currently burning / low health in Nether lava lake, wait for clean respawn
if (bot.health <= 6 && bot.game.dimension === 'the_nether') {
  console.log('Waiting for respawn cycle...');
  const waitStart = Date.now();
  while (bot.game.dimension === 'the_nether' && bot.health <= 6 && Date.now() - waitStart < 15000 && !checkCancelled()) {
    await sleep(500);
  }
}

// Ensure respawn occurred and bot is active
await sleep(1000);
console.log('Current state: Pos =', lib.fmt(bot.entity.position), 'dim =', bot.game.dimension, 'HP =', bot.health, 'Food =', bot.food);

// 2. If in Overworld, sprint to Nether Portal (299.5, 73.0, -54.0) and warp
if (bot.game.dimension === 'overworld') {
  bot.chat('alpha: Respawned in Overworld with full health/food! Sprinting to Nether portal to reunite with team!');

  // Check if near base chest (293, 72, -57) and grab cooked food if available
  if (bot.entity.position.distanceTo(new Vec3(293, 72, -57)) < 8.0) {
    try {
      const chestBlock = bot.findBlock({ matching: b => b && b.name.includes('chest'), maxDistance: 6 });
      if (chestBlock) {
        const chest = await bot.openChest(chestBlock);
        const foodItem = chest.containerItems().find(it => it.name.includes('cooked') || it.name === 'bread' || it.name === 'apple');
        if (foodItem) {
          console.log(`Withdrawing ${foodItem.name} x${foodItem.count} from base chest...`);
          await chest.withdraw(foodItem.type, null, Math.min(foodItem.count, 16));
        }
        chest.close();
      }
    } catch (e) {
      console.log('Base chest check skipped:', e.message);
    }
  }

  // Waypoints across overworld to portal
  const overland = [
    new Vec3(200, 64, -70),
    new Vec3(240, 66, -65),
    new Vec3(280, 70, -60),
    new Vec3(299.5, 73.0, -54.0)
  ];

  for (const wp of overland) {
    if (checkCancelled()) break;
    if (bot.entity.position.distanceTo(wp) < 4.0) continue;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e) {
      try { await lib.goTo(wp.x, wp.y, wp.z, 3.0, { timeoutMs: 10000 }); } catch (e2) {}
    }
  }

  console.log('Arrived near portal frame:', lib.fmt(bot.entity.position));
  console.log('Entering Nether portal...');
  const warpRes = await enterNetherPortal(30000);
  console.log('Warp result:', JSON.stringify(warpRes));

  if (bot.game.dimension !== 'the_nether') {
    const pb = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
    if (pb) {
      await bot.pathfinder.goto(new goals.GoalBlock(pb.position.x, pb.position.y, pb.position.z));
      bot.pathfinder.stop();
      bot.clearControlStates();
      const wait = Date.now();
      while (bot.game.dimension !== 'the_nether' && Date.now() - wait < 15000 && !checkCancelled()) {
        await sleep(250);
      }
    }
  }
}

// 3. March safe waypoints in the Nether to Fortress Workshop Bunker (44, 65, -131)
console.log(`Dimension now: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);

if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In the Nether! Marching safe covered waypoints to Fortress Workshop Bunker (44, 65, -131)!');

  // Strictly configure movements: NO parkour, NO digging, avoid fire & lava
  globalThis.configureFireAvoidance();
  const moves = new Movements(bot, mcData);
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);

  // Equip sword
  try {
    const sword = bot.inventory.items().find(i => i.name.includes('sword'));
    if (sword) await bot.equip(sword, 'hand');
  } catch (e) {}

  // Safe waypoints matching Gamma's proven route
  const BUNKER_WAYPOINTS = [
    { x: 46.0, y: 65.0, z: -7.0 },
    { x: 54.0, y: 65.0, z: -7.0 },
    { x: 63.0, y: 64.0, z: -7.0 },
    { x: 63.0, y: 65.0, z: -20.0 },
    { x: 63.0, y: 66.0, z: -35.0 },
    { x: 62.0, y: 67.0, z: -50.0 },
    { x: 61.5, y: 67.0, z: -55.0 },
    { x: 61.5, y: 67.0, z: -60.0 },
    { x: 61.5, y: 67.0, z: -65.0 },
    { x: 61.5, y: 67.0, z: -70.0 },
    { x: 61.5, y: 67.0, z: -75.0 },
    { x: 62.0, y: 67.0, z: -80.0 },
    { x: 61.0, y: 66.0, z: -100.0 },
    { x: 50.0, y: 65.0, z: -115.0 },
    { x: 47.0, y: 65.0, z: -120.0 }, // Intermediate alignment
    { x: 44.0, y: 65.0, z: -127.0 }, // Bunker entrance
    { x: 44.0, y: 65.0, z: -131.0 }  // Inside Workshop Bunker
  ];

  let startIdx = 0;
  for (let i = 0; i < BUNKER_WAYPOINTS.length; i++) {
    const wp = BUNKER_WAYPOINTS[i];
    if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
      startIdx = i + 1;
    }
  }

  console.log(`Marching from WP index ${startIdx}/${BUNKER_WAYPOINTS.length}...`);

  for (let i = startIdx; i < BUNKER_WAYPOINTS.length && !checkCancelled(); i++) {
    await globalThis.clearFireAhead();

    const wp = BUNKER_WAYPOINTS[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 1.5) continue;

    console.log(`Advancing to WP ${i}: (${wp.x}, ${wp.y}, ${wp.z}) - Current: ${lib.fmt(bot.entity.position)}`);

    // Gaze low at feet level to prevent Enderman aggro
    await bot.lookAt(new Vec3(wp.x, 63.5, wp.z));

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.2));
    } catch (e) {
      try {
        await globalThis.clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
      } catch (e2) {
        console.log(`WP ${i} path retry notice: ${e2.message}`);
      }
    }

    await globalThis.clearFireAhead();
    try { await lib.pickup(3.0); } catch (e) {}

    if (bot.health <= 6) {
      console.log(`HP low (${bot.health}), taking cover at WP ${i}.`);
      break;
    }
  }

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);

  console.log('March complete. Final pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

  // 4. Arrived at Bunker: check for golden_boots
  const distToBunker = bot.entity.position.distanceTo(new Vec3(44, 65, -131));
  console.log(`Distance to Bunker: ${distToBunker.toFixed(1)}m`);

  if (distToBunker < 8.0) {
    bot.chat('alpha: REUNITED AT FORTRESS WORKSHOP BUNKER (44, 65, -131)! Ready for golden_boots and Milestone 9!');

    // Vacuum any dropped items (e.g. golden_boots dropped by Gamma)
    try { await lib.pickup(4.0); } catch (e) {}

    // Check if golden_boots in inventory, equip them!
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) {
      await bot.equip(gb, 'feet');
      bot.chat('alpha: Golden boots EQUIPPED! 100% Piglin neutrality ACTIVE for Milestone 9!');
      console.log('Golden boots EQUIPPED on feet!');
    } else {
      console.log('Golden boots not in inventory yet. Waiting for Gamma to hand over.');
    }
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
