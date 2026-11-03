// programs/542-fast-run-to-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 542: FAST RUN TO PORTAL & WARP ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

if (bot.game.dimension === 'overworld') {
  // Fast running waypoints across plains to base door (294, 72, -54)
  const runWps = [
    { x: 180, y: 64, z: -85 },
    { x: 220, y: 66, z: -70 },
    { x: 260, y: 70, z: -60 },
    { x: 294, y: 72, z: -54 }
  ];

  const moves = new Movements(bot, mcData);
  moves.allowParkour = true;
  moves.canDig = false;
  bot.pathfinder.setMovements(moves);

  for (let i = 0; i < runWps.length && !isCancelled(); i++) {
    const wp = runWps[i];
    console.log(`Running to waypoint ${i + 1}/${runWps.length}: (${wp.x}, ${wp.z})...`);
    try {
      await bot.pathfinder.goto(new goals.GoalXZ(wp.x, wp.z));
    } catch (e) {
      try {
        await bot.lookAt(new Vec3(wp.x, bot.entity.position.y + 1, wp.z), true);
        bot.setControlState('forward', true);
        bot.setControlState('sprint', true);
        bot.setControlState('jump', true);
        await sleep(1500);
        bot.clearControlStates();
      } catch (e2) {}
    }
  }

  console.log('Arrived near Base Door! Pos:', lib.fmt(bot.entity.position));

  // Enter Nether Portal
  console.log('Entering Nether Portal at (299.5, 73.0, -53.5)...');
  bot.chat('gamma: Entering Nether portal at base to join Alpha at bunker!');
  const portalRes = await globalThis.enterNetherPortal(30000);
  console.log('Portal transit result:', JSON.stringify(portalRes));
}

if (bot.game.dimension === 'the_nether') {
  console.log('SUCCESS: Warped to the_nether! Pos:', lib.fmt(bot.entity.position));
  bot.chat(`gamma: Arrived in the_nether at ${lib.fmt(bot.entity.position)}! Marching to bunker (44, 65, -127)!`);

  // Fast march to Bunker (WP 0 -> WP 11)
  globalThis.configureFireAvoidance();
  const bunkerWps = [
    { x: 46, y: 65, z: -7 },
    { x: 54, y: 65, z: -7 },
    { x: 63, y: 64, z: -7 },
    { x: 63, y: 65, z: -20 },
    { x: 63, y: 66, z: -35 },
    { x: 62, y: 67, z: -50 },
    { x: 61.5, y: 67, z: -60 },
    { x: 61.5, y: 67, z: -70 },
    { x: 62, y: 67, z: -80 },
    { x: 61, y: 66, z: -100 },
    { x: 50, y: 65, z: -115 },
    { x: 44, y: 65, z: -127 }
  ];

  let startIdx = 0;
  let closestDist = Infinity;
  for (let i = 0; i < bunkerWps.length; i++) {
    const d = bot.entity.position.distanceTo(new Vec3(bunkerWps[i].x, bunkerWps[i].y, bunkerWps[i].z));
    if (d < closestDist) {
      closestDist = d;
      startIdx = i;
    }
  }
  if (closestDist < 2.0 && startIdx < bunkerWps.length - 1) startIdx++;

  for (let i = startIdx; i < bunkerWps.length && !isCancelled(); i++) {
    const wp = bunkerWps[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 2.0) continue;

    await globalThis.clearFireAhead();
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

    try {
      await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: false, timeoutMs: 12000 });
    } catch (e) {
      try {
        await globalThis.clearFireAhead();
        await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 0.8, wp.z + 0.5), true);
        bot.setControlState('forward', true);
        await sleep(600);
        bot.setControlState('forward', false);
      } catch (e2) {}
    }

    await globalThis.clearFireAhead();
    try { await lib.pickup(3.5); } catch (e) {}

    if (bot.health <= 6) break;
  }

  console.log('Arrived at Bunker! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
  bot.chat(`gamma: Stationed at Fortress Bunker (${lib.fmt(bot.entity.position)}) with Alpha!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
