// programs/540-walk-to-portal-and-transit-nether.js
console.log('=== Step: Transit to Nether & Traverse to Mountain Breach (44, 65, -149) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Equip stone sword for defense
await lib.equipWeapon();

// 1. Navigate to Nether Portal at (298, 73, -54)
const portalPos = new Vec3(298, 73, -54);
console.log(`Walking to Nether Portal at ${lib.fmt(portalPos)}...`);

try {
  await lib.goTo(portalPos.x, portalPos.y, portalPos.z, 1.5, { dig: true });
} catch (e) {
  console.log('goTo portal note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(portalPos.x, portalPos.y, portalPos.z, 1.5));
  } catch (e2) {}
}

console.log('Near portal at:', lib.fmt(bot.entity.position));

// 2. Step into nether_portal block
const portals = bot.findBlocks({
  matching: b => b.name === 'nether_portal',
  maxDistance: 8,
  count: 5
});

if (portals.length > 0) {
  const p = portals[0];
  console.log(`Stepping into nether_portal block at ${lib.fmt(p)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(p.x, p.y, p.z));
  } catch (e) {
    await bot.lookAt(new Vec3(p.x + 0.5, p.y + 0.5, p.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.clearControlStates();
  }
} else {
  console.log('Stepping to portal coordinates...');
  try { await lib.goTo(portalPos.x, portalPos.y, portalPos.z, 0.5); } catch (e) {}
}

bot.clearControlStates();
console.log('Standing completely still inside portal at:', lib.fmt(bot.entity.position));

// 3. Wait for dimension change (takes 80 ticks = 4.0s)
const startDim = bot.game.dimension;
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

// 4. March across Nether East Ridge if in the Nether
if (bot.game.dimension.includes('nether')) {
  console.log('SUCCESS: Inside the Nether! Beginning East Ridge advance to mountain breach...');
  bot.chat('beta: Arrived in Nether at (40, 65, -7)! Marching along East Ridge to mountain breach (44, 65, -149).');

  // Step East out of bunker
  try {
    await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 1));
  } catch (e) {
    await bot.lookAt(new Vec3(46, 65, -7), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.clearControlStates();
  }

  // Delta's verified safe East Ridge waypoints
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
    new Vec3(44, 65, -149)
  ];

  for (let i = 0; i < ridgeWaypoints.length; i++) {
    if (isCancelled()) break;
    const wp = ridgeWaypoints[i];
    console.log(`Advancing to Nether WP ${i+1}/${ridgeWaypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);
    
    // Put out any immediate fire within 3m
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

    // Defend if attacked
    const hostiles = lib.hostiles(8);
    for (const h of hostiles) {
      if (h.dist < 4 && !['zombified_piglin'].includes(h.name)) {
        console.log(`Fighting hostile ${h.name} at dist ${h.dist}...`);
        try { await lib.fight(4, 4); } catch (e) {}
      }
    }
  }

  console.log('Arrived at final Nether position:', lib.fmt(bot.entity.position));
  if (bot.entity.position.z <= -140) {
    bot.chat(`beta: Reached mountain breach at ${lib.fmt(bot.entity.position)}! United with team, ready to tunnel to Blaze Spawner (32, 68, -190)!`);
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health
};
