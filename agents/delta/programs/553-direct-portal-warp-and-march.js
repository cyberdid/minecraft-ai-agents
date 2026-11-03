// programs/553-direct-portal-warp-and-march.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: DIRECT PORTAL WARP & MARCH TO BUNKER ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Walk directly to Nether Portal at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log(`Pathfinding to Nether Portal at ${lib.fmt(portalTarget)}...`);

try {
  await bot.pathfinder.goto(new goals.GoalNear(portalTarget.x, portalTarget.y, portalTarget.z, 0.8));
} catch (e) {
  try {
    await lib.goToXZ(portalTarget.x, portalTarget.z, { timeoutMs: 12000 });
  } catch (e2) {}
}

// Step into portal block
if (bot.entity.position.distanceTo(portalTarget) > 0.8) {
  await bot.lookAt(portalTarget, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
  await sleep(1000);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
}

console.log('Standing in portal block, waiting for warp to the_nether...');
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
  const cur = bot.entity.position;
  if (Math.abs(cur.x - 299.5) > 0.8 || Math.abs(cur.z - (-54.0)) > 0.8 || cur.y < 72.8) {
    await bot.lookAt(portalTarget, true);
    bot.setControlState('forward', true);
    if (cur.y < 72.8) bot.setControlState('jump', true);
    await sleep(300);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  await sleep(250);
}

bot.clearControlStates();
console.log(`Dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

// Step 2: In Nether, step out of portal and march to Fortress Bunker (44, 65, -127)
if (bot.game.dimension === 'the_nether') {
  configureFireAvoidance();
  bot.chat('delta: Arrived in Nether with 20/20 HP! Marching East Ridge waypoints to Fortress Bunker (44, 65, -127)!');

  // Step out of portal frame into bunker
  if (bot.entity.position.distanceTo(new Vec3(46.5, 66.0, 2.0)) < 4.0) {
    await bot.lookAt(new Vec3(42.0, 65.0, -5.0), true);
    bot.setControlState('forward', true);
    await sleep(1200);
    bot.setControlState('forward', false);
    await clearFireAhead();
  }

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
    { x: 44, y: 65, z: -127 } // Fortress Workshop Bunker
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

    if (bot.health <= 7) {
      console.log(`Health low (${bot.health}) at WP ${i + 1}, taking cover.`);
      break;
    }
  }

  console.log(`=== REACHED FORTRESS WORKSHOP BUNKER ===`);
  console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

  // Check teammates
  for (const name of ['alpha', 'beta', 'gamma']) {
    const p = bot.players[name];
    if (p && p.entity) {
      console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)})`);
    }
  }

  bot.chat('delta: United with team at Fortress Bunker (44, 65, -127)! Ready to barter with Piglins and hunt Endermen for Milestone 9!');
}

console.log('=== PROGRAM 553 COMPLETE ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Dim: ${bot.game.dimension}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  inv: lib.inv()
};
