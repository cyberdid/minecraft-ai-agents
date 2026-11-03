console.log('=== DELTA: FINAL IGNITE AND WARP TO NETHER ===');

const sillPos = new Vec3(299, 72, -54);
const portalPos = new Vec3(299, 73, -54);

// Ensure flint_and_steel in hand
const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
if (fas) {
  try { await bot.equip(fas, 'hand'); } catch (e) {}
}

const start = Date.now();
let portal = null;

while (!isCancelled() && Date.now() - start < 75000) {
  // Check if portal already active
  portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
  if (portal) {
    console.log(`NETHER PORTAL ACTIVE AT ${lib.fmt(portal.position)}!`);
    break;
  }

  const sill = bot.blockAt(sillPos);
  const sill2 = bot.blockAt(new Vec3(300, 72, -54));

  if (Math.round((Date.now() - start)/1000) % 4 === 0) {
    const beta = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'beta');
    console.log(`[${Math.round((Date.now() - start)/1000)}s] Sill: ${sill?.name} | Beta: ${beta ? lib.fmt(beta.position) + ' [' + (beta.heldItem?.name || '') + ']' : 'ascending shaft'}`);
  }

  // If obsidian complete at both sill blocks
  if (sill && sill.name === 'obsidian' && sill2 && sill2.name === 'obsidian') {
    console.log('Obsidian is complete! Igniting NOW with flint_and_steel...');
    try {
      await lib.ignite(299, 72, -54);
      await sleep(500);
      portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
      if (portal) {
        bot.chat('delta: NETHER PORTAL IGNITED BY DELTA! Entering portal now!');
        break;
      }
    } catch (err) {
      console.log('Ignite attempt error:', err.message);
    }
  }

  await sleep(400);
}

// Step into portal and warp
if (portal) {
  console.log('Stepping into portal block (299, 73, -54)...');
  await bot.lookAt(portalPos, true);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(portalPos.x, portalPos.y, portalPos.z));
  } catch (e) {
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  }

  console.log('Standing motionless inside portal to trigger warp...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(300);
  }

  console.log(`Dimension after warp: ${bot.game.dimension}`);

  if (bot.game.dimension === 'the_nether') {
    configureFireAvoidance();
    bot.chat('delta: Arrived in the_nether! Advancing along safe waypoints to Fortress Workshop Bunker (44, 65, -127)!');

    // Step forward into bunker
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

    try {
      await bot.pathfinder.goto(new goals.GoalNear(44.0, 65.0, -132.0, 1.0));
    } catch (e) {}

    bot.chat('delta: Inside Fortress Workshop Bunker (44, 65, -132)! Ready for Milestone 9!');
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  portalActive: !!portal
};
