// programs/562-sprint-portal-to-delta-corridor.js
console.log('=== Step: Transit Portal & Advance to Delta Enclosed Corridor (z=-163) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Pass through base door to outside
const doorPos = new Vec3(294, 72, -54);
console.log('Passing through base door...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  console.log('Outside door at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door exit note:', e.message);
  try { await lib.goTo(294, 72, -52, 1); } catch (e2) {}
}

// 2. Step into Nether Portal block at (299, 73, -54)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log(`Stepping into Nether Portal block at ${lib.fmt(portalTarget)}...`);

try {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
} catch (e) {
  await bot.lookAt(portalTarget, true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.clearControlStates();
}

bot.clearControlStates();
console.log('Standing completely still inside portal at:', lib.fmt(bot.entity.position));

// 3. Wait for Nether warp (80 ticks = 4.0s in survival)
const startDim = bot.game.dimension;
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

// 4. March across Nether East Ridge
if (bot.game.dimension.includes('nether')) {
  console.log('SUCCESS: Inside the Nether! Marching to Delta enclosed corridor at z=-163...');
  bot.chat(`beta: In Nether at ${lib.fmt(bot.entity.position)}! Advancing along covered ridge to Delta at (44, 65, -163).`);

  // Step East out of bunker
  try {
    await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 1));
  } catch (e) {
    await bot.lookAt(new Vec3(46, 65, -7), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.clearControlStates();
  }

  // Proven safe ridge waypoints
  const waypoints = [
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
    new Vec3(44, 65, -163)
  ];

  for (let i = 0; i < waypoints.length; i++) {
    if (isCancelled()) break;
    const wp = waypoints[i];
    console.log(`Advancing to Nether WP ${i+1}/${waypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);

    // Extinguish nearby fire within 3m
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
      try { await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false }); } catch (e2) {}
    }

    // Pick up item drops (recovering 50 cobble & tools at z=-125)
    await lib.pickup(8);
    await lib.equipWeapon();

    // Defend if attacked
    const hostiles = lib.hostiles(8);
    for (const h of hostiles) {
      if (h.dist < 4 && !['zombified_piglin'].includes(h.name)) {
        try { await lib.fight(4, 4); } catch (e) {}
      }
    }
  }

  const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
  console.log('Arrived at final position in Nether:', lib.fmt(bot.entity.position));
  console.log('Inventory now:', inv || 'empty');

  if (bot.entity.position.z <= -145) {
    bot.chat(`beta: UNITED AT BLAZE SPAWNER CORRIDOR (${lib.fmt(bot.entity.position)})! Inv: (${inv}). Ready to breach and farm Blaze Rods!`);
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  inventory: bot.inventory.items().map(i => `${i.name}x${i.count}`)
};
