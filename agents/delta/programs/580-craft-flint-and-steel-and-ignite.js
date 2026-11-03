// programs/580-craft-flint-and-steel-and-ignite.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: CRAFT FLINT & STEEL, IGNITE & WARP ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, Flint: ${lib.count('flint')}, Iron: ${lib.count('iron_ingot')}`);

// Step 1: Craft flint_and_steel
if (lib.count('flint_and_steel') === 0 && lib.count('flint') >= 1 && lib.count('iron_ingot') >= 1) {
  try {
    console.log('Crafting flint_and_steel at crafting table...');
    await lib.craft('flint_and_steel', 1);
    console.log('FLINT AND STEEL CRAFTED BY DELTA!');
    bot.chat('delta: Crafted flint_and_steel! Moving to portal frame to ignite as soon as lava is cast!');
  } catch (e) {
    console.log('Craft error:', e.message);
  }
}

// Step 2: Step outside base door to portal frame at (299, 73, -52)
if (bot.entity.position.z < -54.0) {
  console.log('Exiting base door...');
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
}

try {
  await bot.pathfinder.goto(new goals.GoalNear(299.0, 73.0, -52.0, 0.8));
} catch (e) {}

// Step 3: Monitor for obsidian sill and ignite
const start = Date.now();
let portal = null;

while (!isCancelled() && Date.now() - start < 35000) {
  // Check if portal already lit
  portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
  if (portal) {
    console.log(`NETHER PORTAL IS LIT AT ${lib.fmt(portal.position)}!`);
    bot.chat('delta: NETHER PORTAL IS IGNITED! Warping into the_nether!');
    break;
  }

  // Check sill
  const sill = bot.blockAt(new Vec3(299, 72, -54));
  if (sill && sill.name === 'obsidian' && lib.count('flint_and_steel') > 0) {
    console.log('Obsidian is placed at (299, 72, -54)! Igniting portal...');
    try {
      await lib.ignite(299, 72, -54);
      await sleep(600);
      portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
      if (portal) {
        bot.chat('delta: NETHER PORTAL SUCCESSFULLY IGNITED BY DELTA!');
        break;
      }
    } catch (err) {
      console.log('Ignite attempt:', err.message);
    }
  }

  await sleep(600);
}

// Step 4: If portal is lit, step inside and warp to Nether!
if (portal) {
  const pPos = portal.position.offset(0.5, 0, 0.5);
  await bot.lookAt(pPos, true);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(portal.position.x, portal.position.y, portal.position.z));
  } catch (e) {
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  }

  console.log('Inside portal, standing motionless to warp...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
    await sleep(400);
  }

  console.log(`Dimension after warp: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

  if (bot.game.dimension === 'the_nether') {
    configureFireAvoidance();
    bot.chat('delta: Successfully warped into the_nether! Advancing along safe waypoints to Fortress Bunker (44, 65, -127)!');

    // Step out of portal frame into bunker
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
  flint_and_steel: lib.count('flint_and_steel'),
  portalActive: !!portal,
  dimension: bot.game.dimension,
  pos: bot.entity.position
};
