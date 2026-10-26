// programs/549-portal-and-reunite-in-mountain-tunnel.js
console.log('=== Step: Enter Nether Portal & Advance to Mountain Tunnel (z=-160) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Step into Overworld Nether Portal at (298, 73, -54)
const portalPos = new Vec3(298, 73, -54);
console.log(`Walking into Nether Portal at ${lib.fmt(portalPos)}...`);

const portals = bot.findBlocks({ matching: b => b.name === 'nether_portal', maxDistance: 8, count: 5 });
if (portals.length > 0) {
  const p = portals[0];
  console.log(`Found portal block at ${lib.fmt(p)}, stepping inside...`);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(p.x, p.y, p.z));
  } catch (e) {
    await bot.lookAt(new Vec3(p.x + 0.5, p.y + 0.5, p.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.clearControlStates();
  }
} else {
  try { await lib.goTo(portalPos.x, portalPos.y, portalPos.z, 0.5); } catch (e) {}
}

bot.clearControlStates();
console.log('Standing completely still inside portal at:', lib.fmt(bot.entity.position));

// 2. Wait for dimension change (80 ticks = 4.0s)
const startDim = bot.game.dimension;
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

// 3. March across Nether East Ridge
if (bot.game.dimension.includes('nether')) {
  console.log('SUCCESS: Inside the Nether! Beginning East Ridge march...');
  bot.chat(`beta: In the Nether at ${lib.fmt(bot.entity.position)}! Marching along East Ridge to unite with Delta at mountain tunnel (z=-160).`);

  // Step East out of bunker
  try {
    await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 1));
  } catch (e) {
    await bot.lookAt(new Vec3(46, 65, -7), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.clearControlStates();
  }

  // Delta's proven safe waypoints
  const ridgeWaypoints = [
    new Vec3(63, 64, -5),
    new Vec3(63, 66, -20),
    new Vec3(63, 66, -35),
    new Vec3(62, 67, -50),
    new Vec3(61, 67, -65),
    new Vec3(54, 65, -90),
    new Vec3(44, 66, -127),
    new Vec3(44, 65, -135),
    new Vec3(44, 65, -141),
    new Vec3(44, 65, -149),
    new Vec3(44, 65, -160)
  ];

  for (let i = 0; i < ridgeWaypoints.length; i++) {
    if (isCancelled()) break;
    const wp = ridgeWaypoints[i];
    console.log(`Advancing to Nether WP ${i+1}/${ridgeWaypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);

    // Put out any nearby fire within 3m
    const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
    const fires = bot.findBlocks({ matching: fireIds, maxDistance: 3, count: 4 });
    for (const fp of fires) {
      try { await lib.dig(fp.x, fp.y, fp.z); } catch (e) {}
    }

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
      console.log(`Reached WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
    } catch (err) {
      console.log(`WP ${i+1} path note:`, err.message);
    }

    // Pick up any item drops along the trail (especially at z=-125)
    await lib.pickup(6);

    // Equip best weapon if we picked one up
    await lib.equipWeapon();

    // Defend if attacked
    const hostiles = lib.hostiles(8);
    for (const h of hostiles) {
      if (h.dist < 4 && !['zombified_piglin'].includes(h.name)) {
        console.log(`Fighting hostile ${h.name} at dist ${h.dist}...`);
        try { await lib.fight(4, 4); } catch (e) {}
      }
    }
  }

  console.log('Arrived at final position:', lib.fmt(bot.entity.position));
  const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
  console.log('Inventory now:', inv);

  if (bot.entity.position.z <= -145) {
    bot.chat(`beta: UNITED IN MOUNTAIN TUNNEL at ${lib.fmt(bot.entity.position)}! Inv: (${inv}). Ready to dig straight to Blaze Spawner (32, 68, -190)!`);
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  inv: bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ')
};
