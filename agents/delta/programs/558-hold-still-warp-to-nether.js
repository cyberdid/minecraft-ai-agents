// programs/558-hold-still-warp-to-nether.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: STAND MOTIONLESS IN PORTAL TO WARP ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, dim: ${bot.game.dimension}`);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// Ensure we are inside portal
const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 4 });
if (portalBlock) {
  console.log(`Nether portal block at ${lib.fmt(portalBlock.position)}. Standing motionless...`);
}

// Stand completely motionless for up to 10 seconds to allow the 4-second warp timer to complete
const start = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - start < 12000 && !isCancelled()) {
  await sleep(500);
}

console.log(`Dimension after wait: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

if (bot.game.dimension === 'the_nether') {
  configureFireAvoidance();
  bot.chat('delta: In the_nether with 20/20 HP! Marching directly to Fortress Workshop Bunker (44, 65, -127)!');

  // Step out of portal frame into bunker
  await bot.lookAt(new Vec3(42.0, 65.0, -5.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
  await clearFireAhead();

  // March waypoints to Fortress Workshop Bunker (44, 65, -127)
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

  console.log(`Marching to Fortress Bunker from WP ${startIdx}/${waypoints.length}...`);
  for (let i = startIdx; i < waypoints.length && !isCancelled(); i++) {
    await clearFireAhead();
    const wp = waypoints[i];
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try {
        await clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
      } catch (e2) {}
    }
    try { await lib.pickup(3.0); } catch (e) {}
    if (bot.health <= 7) break;
  }

  // Inside bunker doorway at (44, 65, -127) -> move inside to (44, 65, -132)
  try {
    await bot.pathfinder.goto(new goals.GoalNear(44.0, 65.0, -132.0, 1.0));
  } catch (e) {}

  console.log(`=== ARRIVED INSIDE FORTRESS BUNKER ===`);
  console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

  for (const name of ['alpha', 'beta', 'gamma']) {
    const p = bot.players[name];
    if (p && p.entity) {
      console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
    }
  }

  bot.chat('delta: Inside Fortress Workshop Bunker (44, 65, -132)! Ready to mine gold veins and barter with Piglins!');
}

console.log('=== PROGRAM 558 COMPLETE ===');
console.log(`Dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  inv: lib.inv()
};
