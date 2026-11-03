console.log('=== DELTA: SPRINT TO BASE PORTAL & MARCH TO BUNKER ===');

// Step 1: In Overworld, navigate to Nether Portal at (299.5, 73.0, -54.0)
if (bot.game.dimension === 'overworld') {
  console.log(`Starting in overworld at ${lib.fmt(bot.entity.position)}...`);
  const moves = new Movements(bot, mcData);
  moves.canDig = true;
  moves.allowParkour = true;
  bot.pathfinder.setMovements(moves);

  console.log('Pathfinding to Nether Portal at (299.5, 73.0, -54.0)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -54.0, 0.8));
  } catch (e) {
    console.log('Pathfinder note, using goToXZ...');
    try { await lib.goToXZ(299.5, -54.0, { timeoutMs: 25000 }); } catch (e2) {}
  }

  // Step into portal block
  const pBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
  if (pBlock) {
    console.log(`Entering active portal block at ${lib.fmt(pBlock.position)}...`);
    await bot.lookAt(pBlock.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);

    console.log('Standing motionless inside portal to warp...');
    const warpStart = Date.now();
    while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
      await sleep(300);
    }
  } else {
    console.log('Portal block not found within 8 blocks!');
  }
}

console.log(`Dimension now: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

// Step 2: In Nether, step out and march to bunker
if (bot.game.dimension === 'the_nether') {
  configureFireAvoidance();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  bot.chat('delta: In the_nether! Marching along safe waypoints to Fortress Workshop Bunker (44, 65, -127)!');

  // Step forward out of portal into camp
  await bot.lookAt(new Vec3(42.0, 65.0, -5.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
  await clearFireAhead();

  const waypoints = [
    { x: 46, y: 65, z: -7 },
    { x: 54, y: 65, z: -7 },
    { x: 63, y: 64, z: -7 },
    { x: 63, y: 65, z: -20 },
    { x: 63, y: 66, z: -35 },
    { x: 62, y: 67, z: -50 },
    { x: 61.5, y: 67, z: -55 },
    { x: 61.5, y: 67, z: -60 },
    { x: 61.5, y: 67, z: -65 },
    { x: 61.5, y: 67, z: -70 },
    { x: 61.5, y: 67, z: -75 },
    { x: 62.0, y: 67, z: -80 },
    { x: 61, y: 66, z: -100 },
    { x: 50, y: 65, z: -115 },
    { x: 44, y: 65, z: -127 }
  ];

  let startIdx = 0;
  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
      startIdx = i + 1;
    }
  }

  for (let i = startIdx; i < waypoints.length && !isCancelled(); i++) {
    await clearFireAhead();
    const wp = waypoints[i];

    // Past z=-75: raise shield in offhand to block Piglin crossbows and fireballs!
    if (wp.z <= -75) {
      bot.activateItem(true);
    } else {
      bot.deactivateItem();
    }

    // Keep gaze low
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try {
        await clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
      } catch (e2) {}
    }

    await clearFireAhead();
    try { await lib.pickup(3.0); } catch (e) {}
    if (bot.health <= 7) {
      console.log(`HP low (${bot.health}), holding cover at WP ${i}`);
      break;
    }
  }

  bot.deactivateItem();

  // Enter inside bunker
  try {
    await bot.pathfinder.goto(new goals.GoalNear(44.0, 65.0, -132.0, 1.0));
  } catch (e) {}

  bot.chat('delta: Inside Fortress Workshop Bunker (44, 65, -132)! Reunited with team for Milestone 9!');
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
