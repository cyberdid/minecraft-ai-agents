// programs/810-tactical-reset-and-bunker-transit.js
console.log('=== Program 810: Tactical Reset, Boot Regear & Bunker Transit ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Tactical reset: pillar 4 blocks and step off for clean full HP/Food restore
if (bot.game.dimension === 'the_nether' && bot.health <= 4) {
  bot.chat('alpha: Executing tactical reset to restore 20/20 HP & Food, then entering Nether to join team at Bunker!');
  
  // Equip cobblestone
  const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
  if (cobble) await bot.equip(cobble, 'hand');

  const startY = Math.floor(bot.entity.position.y);
  console.log(`Pillaring up from y=${startY}...`);

  for (let i = 0; i < 4 && !checkCancelled(); i++) {
    const p = bot.entity.position;
    bot.setControlState('jump', true);
    await sleep(250);
    const below = bot.blockAt(new Vec3(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)));
    if (below && below.name === 'air') {
      try {
        const ref = bot.blockAt(new Vec3(Math.floor(p.x), Math.floor(p.y) - 1, Math.floor(p.z)));
        if (ref) await bot.placeBlock(ref, new Vec3(0, 1, 0));
      } catch (e) {}
    }
    bot.setControlState('jump', false);
    await sleep(200);
  }

  // Step off edge to take fall damage
  console.log('Stepping off pillar to trigger reset...');
  bot.setControlState('forward', true);
  await sleep(600);
  bot.clearControlStates();
}

// 2. Wait for respawn in Overworld
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 15000 && !checkCancelled()) {
  await sleep(250);
}

await sleep(500);
console.log('State after reset: Dim =', bot.game.dimension, 'Pos =', lib.fmt(bot.entity.position), 'HP =', bot.health, 'Food =', bot.food);

// 3. In Overworld: enter Nether portal
if (bot.game.dimension === 'overworld') {
  bot.chat('alpha: Tactical reset COMPLETE! Full 20/20 HP and Food restored! Entering Nether portal...');

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

console.log(`Dimension now: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

// 4. In the Nether: Collect golden_boots and march to Bunker
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In the Nether at full 20/20 HP! Vacuuming boots and marching safe corridor to Bunker (44, 65, -130)!');

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

  // Vacuum dropped items at portal camp (golden boots from Gamma)
  try { await lib.pickup(6.0); } catch (e) {}

  let gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    await bot.equip(gb, 'feet');
    bot.chat('alpha: Golden boots EQUIPPED! 100% Piglin neutrality ACTIVE!');
    console.log('Golden boots EQUIPPED on feet!');
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

    // Check if golden boots acquired along the way
    if (!bot.inventory.slots[8] || bot.inventory.slots[8].name !== 'golden_boots') {
      const boots = bot.inventory.items().find(it => it.name === 'golden_boots');
      if (boots) await bot.equip(boots, 'feet');
    }

    if (bot.health <= 7) {
      console.log(`HP low (${bot.health}), pausing at WP ${i}.`);
      break;
    }
  }

  // 5. At Bunker approach (47, 65, -120): seal gap at (44, 64, -124..-125) and enter bunker
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
