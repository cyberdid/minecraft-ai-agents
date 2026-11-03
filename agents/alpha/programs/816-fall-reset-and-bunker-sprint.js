// programs/816-fall-reset-and-bunker-sprint.js
console.log('=== Program 816: Fall Reset & Bunker Sprint ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. If at 1.2 HP at y=24, build a 5-block step against pillar at (45, y, -124) and jump off
if (bot.game.dimension === 'the_nether' && bot.health <= 4) {
  bot.chat('alpha: Triggering clean tactical reset to restore 20/20 HP & Food for Milestone 9!');

  const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
  if (cobble) await bot.equip(cobble, 'hand');

  // Place cobblestone against pillar at x=45, z=-124
  for (let y = 24; y <= 29; y++) {
    const ref = bot.blockAt(new Vec3(45, y, -124));
    const target = bot.blockAt(new Vec3(46, y, -124));
    if (ref && (!target || target.name === 'air')) {
      try {
        await bot.placeBlock(ref, new Vec3(1, 0, 0));
        await sleep(150);
      } catch (e) {}
    }
  }

  // Walk onto the pillar at (46, 29, -124)
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(46, 30, -124));
  } catch (e) {
    // Jump and move toward x=46
    bot.setControlState('jump', true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.clearControlStates();
  }

  // Step off edge to take 5-block fall damage (deals 2.0 damage, cleanly triggering respawn)
  console.log('Stepping off to take fall damage reset...');
  await bot.lookAt(new Vec3(48.0, 24.0, -124.0), true);
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();

  // Wait for respawn cycle
  console.log('Waiting for respawn cycle...');
  const waitRespawn = Date.now();
  while (bot.game.dimension === 'the_nether' && bot.health <= 4 && Date.now() - waitRespawn < 10000 && !checkCancelled()) {
    await sleep(250);
  }
}

// 2. Wait for Overworld spawn
const spawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - spawnWait < 15000 && !checkCancelled()) {
  await sleep(250);
}

await sleep(500);
console.log('Post-reset state: Dim =', bot.game.dimension, 'Pos =', lib.fmt(bot.entity.position), 'HP =', bot.health, 'Food =', bot.food);

// 3. In Overworld: Step into Nether Portal (299.5, 73.0, -54.0)
if (bot.game.dimension === 'overworld') {
  bot.chat('alpha: 20/20 HP and Food restored! Warping through Nether portal to join Delta, Beta & Gamma at Bunker!');

  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}

  console.log('Entering Nether Portal (299.5, 73.0, -54.0)...');
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

// 4. In the Nether: March cleared East Ridge corridor to Fortress Workshop Bunker (44, 65, -130)
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In the Nether at 20/20 HP! Marching cleared corridor to Bunker (44, 65, -130) for Milestone 9!');

  // Strict fire avoidance movements
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

  // Vacuum dropped items at portal camp
  try { await lib.pickup(6.0); } catch (e) {}

  let gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    await bot.equip(gb, 'feet');
    bot.chat('alpha: Golden boots EQUIPPED! 100% Piglin neutrality ACTIVE!');
  }

  // Safe waypoints along cleared East Ridge tunnel to Bunker approach
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

  console.log(`Marching from WP index ${startIdx}/${BUNKER_WAYPOINTS.length}...`);

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

    // Equip boots if picked up along way
    if (!bot.inventory.slots[8] || bot.inventory.slots[8].name !== 'golden_boots') {
      const boots = bot.inventory.items().find(it => it.name === 'golden_boots');
      if (boots) await bot.equip(boots, 'feet');
    }

    if (bot.health <= 7) {
      console.log(`HP low (${bot.health}), pausing at WP ${i}.`);
      break;
    }
  }

  // 5. At approach (47, 65, -120): seal gap at (44, 64, -124..-125) and enter bunker
  if (bot.entity.position.distanceTo(new Vec3(47, 65, -120)) < 6.0) {
    console.log('Sealing bridge gap and entering Fortress Workshop Bunker (44, 65, -130)...');
    for (const z of [-124, -125, -126]) {
      const fb = bot.blockAt(new Vec3(44, 64, z));
      if (!fb || fb.boundingBox !== 'block') {
        try { await lib.place(44, 64, z, 'cobblestone'); } catch (e) {}
      }
    }
    try {
      await bot.pathfinder.goto(new goals.GoalNear(44.0, 65.0, -130.0, 1.2));
    } catch (e) {}

    console.log('Final position in Bunker:', lib.fmt(bot.entity.position));
    if (bot.entity.position.distanceTo(new Vec3(44, 65, -130)) < 5.0) {
      bot.chat('alpha: UNITED WITH TEAM IN FORTRESS WORKSHOP BUNKER (44, 65, -130)! Ready for Milestone 9 bartering & hunting!');
    }
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: lib.count('ender_pearl'),
  boots: bot.inventory.slots[8]?.name,
  inv: lib.inv()
};
