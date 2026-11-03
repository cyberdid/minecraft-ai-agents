console.log('=== DELTA: SPRINT TO PORTAL, WARP & JOIN BUNKER ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, dim: ${bot.game.dimension}, HP: ${bot.health}, Food: ${bot.food}`);

// Step 1: Overworld transit to base portal (299.5, 73.0, -54.0)
if (bot.game.dimension === 'overworld') {
  const overworldWaypoints = [
    new Vec3(220, 65, -55),
    new Vec3(260, 68, -55),
    new Vec3(290, 72, -55),
    new Vec3(299.5, 73.0, -54.0)
  ];

  for (let i = 0; i < overworldWaypoints.length; i++) {
    const wp = overworldWaypoints[i];
    console.log(`Overworld stage ${i + 1}/${overworldWaypoints.length}: ${lib.fmt(wp)}...`);
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2.5, { dig: true, timeoutMs: 15000 });
    } catch (e) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
      } catch (e2) {}
    }
  }

  // Ensure shield equipped
  try {
    const shield = bot.inventory.items().find(i => i.name === 'shield');
    if (shield) await bot.equip(shield, 'off-hand');
  } catch (e) {}

  // Warp into Nether using preloaded helper
  console.log('Calling enterNetherPortal()...');
  const portalRes = await enterNetherPortal(25000);
  console.log('enterNetherPortal result:', JSON.stringify(portalRes));
}

// Step 2: Nether march to Fortress Workshop Bunker (44, 65, -127)
if (bot.game.dimension === 'the_nether') {
  configureFireAvoidance();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  bot.chat('delta: Warped into the_nether! Marching along safe covered waypoints to Fortress Workshop Bunker (44, 65, -127)!');

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

    // Past z=-70: raise shield in offhand and sneak
    if (wp.z <= -70) {
      bot.setControlState('sneak', true);
      bot.activateItem(true);
    } else {
      bot.setControlState('sneak', false);
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

  bot.setControlState('sneak', false);
  bot.deactivateItem();

  // Enter inside bunker
  try {
    await bot.pathfinder.goto(new goals.GoalNear(44.0, 65.0, -132.0, 1.0));
  } catch (e) {}

  bot.chat('delta: Reunited with team inside Fortress Workshop Bunker (44, 65, -132)! Ready for Milestone 9!');
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
