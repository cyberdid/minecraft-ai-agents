// programs/576-enter-nether-extinguish-fire-recover-trail.js
console.log('=== Step: Enter Base, Lock Spawn, Transit Nether, Extinguish Fire & Recover Drops ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Walk to base door (294, 72, -54) and enter
console.log('Walking to base door...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 1));
} catch (e) {
  await lib.goTo(294, 72, -54, 1, { dig: false });
}

console.log('Entering base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1));
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside Base at:', lib.fmt(bot.entity.position));

// 2. Lock spawn at bed
try {
  await lib.setSpawn();
  console.log('SUCCESS: Bed spawn locked at Base!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 3. Step out base door to Nether portal (298.5, 73.0, -54.0)
console.log('Stepping outside to Nether portal...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalNear(296, 72, -54, 1));
  } catch (e2) {}
}

const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Entering Nether portal...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
}

// 4. Wait for Nether warp (80 ticks = 4.0s)
const startDim = bot.game.dimension;
for (let s = 0; s < 10; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

// 5. In Nether: Exit bunker East and EXTINGUISH ALL SOUL FIRE
if (bot.game.dimension.includes('nether')) {
  console.log('In Nether! Exiting bunker East to (46, 65, -7)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 1));
  } catch (e) {
    await bot.lookAt(new Vec3(46, 65, -7), true);
    bot.setControlState('forward', true);
    await sleep(1000);
    bot.clearControlStates();
  }

  // Extinguish ALL fire and soul_fire within 12 blocks
  async function extinguishAllFires() {
    const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
    const fires = bot.findBlocks({ matching: fireIds, maxDistance: 12, count: 20 });
    console.log(`Extinguishing ${fires.length} fire/soul_fire blocks...`);
    for (const fp of fires) {
      try {
        await lib.dig(fp.x, fp.y, fp.z);
        console.log(`Put out fire at (${fp.x}, ${fp.y}, ${fp.z})`);
      } catch (e) {}
    }
  }

  await extinguishAllFires();

  // 6. Advance along trail to WP 1 (63, 64, -5) and WP 2 (63, 66, -20), clearing fire step by step
  const trailWaypoints = [
    new Vec3(55, 66, -5),
    new Vec3(63, 64, -5),
    new Vec3(63, 66, -10),
    new Vec3(63, 66, -20)
  ];

  for (const wp of trailWaypoints) {
    if (isCancelled()) break;
    await extinguishAllFires();
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    } catch (e) {
      try { await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false }); } catch (e2) {}
    }
    await lib.pickup(10);
    await lib.equipArmor();
    await lib.equipWeapon();
  }

  console.log('Recovered trail gear! Inv:', JSON.stringify(lib.inv()), 'Gear:', JSON.stringify(lib.tools()));
  bot.chat(`beta: Cleared soul fire on East Ridge trail! Inv: ${Object.keys(lib.inv()).map(k => `${k}x${lib.count(k)}`).join(', ')}. Marching forward!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  inv: lib.inv()
};
