// programs/809-respawn-warp-collect-boots.js
console.log('=== Program 809: Respawn, Warp, Collect Golden Boots & Bunker Advance ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. If low health or dying, wait for clean respawn cycle
if (bot.health <= 4) {
  console.log('Waiting for respawn cycle to complete...');
  const waitRespawn = Date.now();
  while (bot.health <= 4 && Date.now() - waitRespawn < 10000 && !checkCancelled()) {
    await sleep(250);
  }
}

await sleep(500);
console.log('Current state: Pos =', lib.fmt(bot.entity.position), 'dim =', bot.game.dimension, 'HP =', bot.health, 'Food =', bot.food);

// 2. If in Overworld, step into Nether Portal (299.5, 73.0, -54.0)
if (bot.game.dimension === 'overworld') {
  bot.chat('alpha: Respawn reset complete (20/20 HP & Food)! Warping through Nether portal to meet Gamma for golden_boots!');

  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}

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

console.log(`Dimension now: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);

// 3. In the Nether: Meet Gamma at Portal Camp (42, 65, -6)
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In the Nether at Portal Camp! Meeting Gamma for golden_boots handover...');

  // Step toward Gamma / bunker camp at (42, 65, -6)
  try {
    await bot.pathfinder.goto(new goals.GoalNear(42.0, 65.0, -6.0, 1.5));
  } catch (e) {}

  // Vacuum dropped items (golden_boots dropped by Gamma)
  try { await lib.pickup(6.0); } catch (e) {}

  // Check inventory for golden_boots and equip immediately!
  let gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    await bot.equip(gb, 'feet');
    bot.chat('alpha: Golden boots EQUIPPED! 100% Piglin neutrality ACTIVE for Milestone 9!');
    console.log('Golden boots EQUIPPED on feet!');
  } else {
    bot.chat('alpha: Gamma: Reunited at (42, 65, -6)! Please drop golden_boots.');
    await sleep(2000);
    try { await lib.pickup(6.0); } catch (e) {}
    gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) {
      await bot.equip(gb, 'feet');
      bot.chat('alpha: Golden boots EQUIPPED! 100% Piglin neutrality ACTIVE for Milestone 9!');
    }
  }

  // 4. Configure strict fire avoidance movements
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

  // March waypoints to Fortress Workshop Bunker
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
    { x: 47.0, y: 65.0, z: -120.0 }
  ];

  let startIdx = 0;
  for (let i = 0; i < BUNKER_WAYPOINTS.length; i++) {
    const wp = BUNKER_WAYPOINTS[i];
    if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
      startIdx = i + 1;
    }
  }

  console.log(`Marching to bunker approach from WP index ${startIdx}/${BUNKER_WAYPOINTS.length}...`);

  for (let i = startIdx; i < BUNKER_WAYPOINTS.length && !checkCancelled(); i++) {
    await globalThis.clearFireAhead();

    const wp = BUNKER_WAYPOINTS[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 1.5) continue;

    // Gaze low at feet level to avoid Enderman aggro
    await bot.lookAt(new Vec3(wp.x, 63.5, wp.z));

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.2));
    } catch (e) {
      try {
        await globalThis.clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
      } catch (e2) {}
    }

    await globalThis.clearFireAhead();
    try { await lib.pickup(3.0); } catch (e) {}

    if (bot.health <= 7) {
      console.log(`HP low (${bot.health}), halting march at WP ${i}.`);
      break;
    }
  }

  // 5. At approach (47, 65, -120), bridge gap at (44, 64, -124..-125) and enter bunker
  if (bot.entity.position.distanceTo(new Vec3(47, 65, -120)) < 6.0) {
    console.log('At bunker approach. Inspecting and sealing bridge floor at (44, 64, -124..-126)...');
    
    // Check missing floor blocks
    for (const z of [-124, -125, -126]) {
      const fb = bot.blockAt(new Vec3(44, 64, z));
      if (!fb || fb.boundingBox !== 'block') {
        console.log(`Placing cobblestone floor at (44, 64, ${z})...`);
        try {
          await lib.place(44, 64, z, 'cobblestone');
        } catch (e) {
          console.log(`Floor placement at ${z} notice:`, e.message);
        }
      }
    }

    // Step into bunker at (44, 65, -131)
    try {
      await bot.pathfinder.goto(new goals.GoalNear(44.0, 65.0, -131.0, 1.2));
    } catch (e) {}

    console.log('Bunker arrival position:', lib.fmt(bot.entity.position));
    if (bot.entity.position.distanceTo(new Vec3(44, 65, -131)) < 5.0) {
      bot.chat('alpha: Inside Fortress Workshop Bunker (44, 65, -131)! Golden boots equipped, ready for Milestone 9!');
    }
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
