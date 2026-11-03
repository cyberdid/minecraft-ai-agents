// programs/571-standby-and-warp-on-ignite.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: STANDBY FOR PORTAL REIGNITION & WARP ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

bot.chat('delta: Standing by at portal! Alpha has Bucket & Flint&Steel! Ready to warp into Nether the moment it ignites!');

// Wait for portal to ignite (up to 40 seconds)
const start = Date.now();
let portalFound = null;

while (!isCancelled() && Date.now() - start < 40000) {
  portalFound = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
  if (portalFound) {
    console.log(`NETHER PORTAL IS LIT AT ${lib.fmt(portalFound.position)}!`);
    bot.chat('delta: NETHER PORTAL IS LIT! Entering portal now!');
    break;
  }
  
  // Also check if sill block changed to obsidian
  const sill = bot.blockAt(new Vec3(299, 72, -54));
  if (sill && sill.name === 'obsidian') {
    console.log('Obsidian cast complete at sill (299, 72, -54)! Awaiting ignition...');
  }
  
  await sleep(600);
}

if (portalFound) {
  // Step into portal block
  const pPos = portalFound.position.offset(0.5, 0, 0.5);
  await bot.lookAt(pPos, true);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(portalFound.position.x, portalFound.position.y, portalFound.position.z));
  } catch (e) {
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  }

  console.log('Inside portal block, standing motionless to warp...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
    await sleep(400);
  }
  
  console.log(`Dimension after warp: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

  // If in Nether, step out and march!
  if (bot.game.dimension === 'the_nether') {
    configureFireAvoidance();
    bot.chat('delta: In Nether! Marching along covered waypoints to Fortress Workshop Bunker (44, 65, -127)!');
    
    // Step forward into camp bunker
    await bot.lookAt(new Vec3(42.0, 65.0, -5.0), true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.setControlState('forward', false);
    await clearFireAhead();

    // March waypoints to bunker
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

    // Step into bunker room (44, 65, -132)
    try {
      await bot.pathfinder.goto(new goals.GoalNear(44.0, 65.0, -132.0, 1.0));
    } catch (e) {}

    bot.chat('delta: Inside Fortress Workshop Bunker (44, 65, -132)! Ready for Milestone 9!');
  }
} else {
  console.log('Portal was not lit within 40 seconds.');
}

return {
  portalLit: !!portalFound,
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health
};
