// programs/805-warp-nether-and-regear-boots.js
console.log('=== Program 805: Warp into Nether, Regear Boots & March to Bunker ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Exit base and step into Overworld Nether Portal (299.5, 73.0, -54.0)
if (bot.game.dimension === 'overworld') {
  console.log('Passing through base door (294, 72, -54)...');
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}

  bot.chat('alpha: Warping through Nether Portal (299.5, 73.0, -54.0) into the Nether to rendezvous with Gamma!');
  console.log('Calling enterNetherPortal()...');
  const warpRes = await enterNetherPortal(25000);
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

console.log(`Dimension now: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

// 2. In the Nether: Rendezvous and check for golden_boots
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: Arrived in the_nether! Scanning for Gamma and golden_boots...');

  // Configure strict fire avoidance movements
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

  // Vacuum any dropped items near portal
  try { await lib.pickup(5.0); } catch (e) {}

  // Check if golden_boots in inventory, equip on feet
  let gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    await bot.equip(gb, 'feet');
    bot.chat('alpha: Golden boots EQUIPPED! 100% Piglin neutrality ACTIVE for Milestone 9!');
    console.log('Golden boots EQUIPPED on feet!');
  } else {
    bot.chat('alpha: Gamma: Reunited at Portal Camp! Dropping by for golden_boots handover.');
  }

  // 3. March safe covered waypoints to Fortress Workshop Bunker (44, 65, -131)
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
    { x: 47.0, y: 65.0, z: -120.0 },
    { x: 44.0, y: 65.0, z: -127.0 },
    { x: 44.0, y: 65.0, z: -131.0 }
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
        console.log(`WP ${i} retry notice: ${e2.message}`);
      }
    }

    await globalThis.clearFireAhead();
    try { await lib.pickup(3.0); } catch (e) {}

    // Check if golden_boots were picked up on the way
    if (!bot.inventory.slots[8] || bot.inventory.slots[8].name !== 'golden_boots') {
      const bootsItem = bot.inventory.items().find(it => it.name === 'golden_boots');
      if (bootsItem) {
        await bot.equip(bootsItem, 'feet');
        bot.chat('alpha: Golden boots EQUIPPED! 100% Piglin neutrality ACTIVE!');
      }
    }

    if (bot.health <= 7) {
      console.log(`HP low (${bot.health}), taking cover at WP ${i}.`);
      break;
    }
  }

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);

  console.log('March complete. Final pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

  const distToBunker = bot.entity.position.distanceTo(new Vec3(44, 65, -131));
  console.log(`Distance to Bunker: ${distToBunker.toFixed(1)}m`);

  if (distToBunker < 8.0) {
    bot.chat('alpha: Reunited at Fortress Workshop Bunker (44, 65, -131)! Ready for Milestone 9 bartering and Enderman hunting!');
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  boots: bot.inventory.slots[8]?.name,
  pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
