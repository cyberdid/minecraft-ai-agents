// programs/563-sprint-base-to-spawner-balcony.js
console.log('=== Step: Sprint to Base, Transit Nether, and Rush to Blaze Spawner Balcony ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Sprint ~200m to Base Camp (293, 72, -54)
const overworldWaypoints = [
  new Vec3(140, 64, -70),
  new Vec3(190, 65, -65),
  new Vec3(240, 68, -60),
  new Vec3(285, 72, -55)
];

bot.chat('beta: Sprinting East from spawn to Base Camp...');

for (const wp of overworldWaypoints) {
  if (isCancelled()) break;
  console.log(`Running to Overworld WP: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
    console.log(`Reached ${lib.fmt(wp)}: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Path note at ${lib.fmt(wp)}, sprinting direct:`, err.message);
    await bot.lookAt(new Vec3(wp.x, bot.entity.position.y, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(3500);
    bot.clearControlStates();
  }
}

console.log('Arrived near Base Camp at:', lib.fmt(bot.entity.position));

// 2. Step into Nether Portal block at (299, 73, -54)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log(`Stepping into Nether Portal block at ${lib.fmt(portalTarget)}...`);

try {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: true });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
  } catch (e2) {
    await bot.lookAt(portalTarget, true);
    bot.setControlState('forward', true);
    await sleep(1000);
    bot.clearControlStates();
  }
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

// 4. March across Nether East Ridge to Spawner Balcony
if (bot.game.dimension.includes('nether')) {
  console.log('SUCCESS: Inside the Nether! Marching to Blaze Spawner Balcony at (43, 64, -179)...');
  bot.chat(`beta: In Nether at ${lib.fmt(bot.entity.position)}! Rushing to join Alpha & Gamma at Blaze Spawner balcony (43, 64, -179).`);

  // Step East out of bunker
  try {
    await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 1));
  } catch (e) {
    await bot.lookAt(new Vec3(46, 65, -7), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.clearControlStates();
  }

  // Waypoints through covered bridge & walkway all the way to Spawner Balcony
  const netherWaypoints = [
    new Vec3(63, 64, -5),
    new Vec3(63, 66, -20),
    new Vec3(63, 66, -35),
    new Vec3(62, 67, -50),
    new Vec3(61, 67, -65),
    new Vec3(54, 65, -90),
    new Vec3(44, 66, -127),
    new Vec3(44, 65, -141),
    new Vec3(44, 65, -149),
    new Vec3(44, 64, -165),
    new Vec3(44, 64, -174),
    new Vec3(43, 64, -179)
  ];

  for (let i = 0; i < netherWaypoints.length; i++) {
    if (isCancelled()) break;
    const wp = netherWaypoints[i];
    console.log(`Advancing to Nether WP ${i+1}/${netherWaypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);

    // Extinguish nearby fire
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

    // Pick up items along the way (dropped tools, cobblestone, blaze rods)
    await lib.pickup(8);
    await lib.equipWeapon();
  }

  // 5. Arrived at Spawner Balcony!
  console.log('Arrived at Blaze Spawner Balcony! Pos:', lib.fmt(bot.entity.position));
  await lib.pickup(10);
  const blazeRods = bot.inventory.count(mcData.itemsByName.blaze_rod?.id || 0);
  const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
  console.log(`Inventory now: ${inv || 'empty'}, Blaze Rods: ${blazeRods}`);

  bot.chat(`beta: UNITED AT BLAZE SPAWNER BALCONY (${lib.fmt(bot.entity.position)})! Blaze Rods: ${blazeRods}, Inv: (${inv}). Slashing Blazes with Alpha & Gamma!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  blazeRods: bot.inventory.count(mcData.itemsByName.blaze_rod?.id || 0)
};
