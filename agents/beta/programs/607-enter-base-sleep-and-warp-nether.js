// programs/607-enter-base-sleep-and-warp-nether.js
console.log('=== Step: Enter Base, Sleep with Alpha to Skip Night & Warp to Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Walk to base door
console.log('Walking to base door at (294, 72, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 2));
} catch (e) {
  try { await lib.goTo(294, 72, -54, 2, { dig: false }); } catch (e2) {}
}

// 2. Enter base
console.log('Entering base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Wait for sleep time (12542)
console.log('Waiting for time >= 12542 to sleep...');
while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  await sleep(1000);
}

// 4. Sleep in bed
console.log('Sleeping in bed to skip night...');
try {
  await lib.sleepInBed();
  console.log('Sleeping in bed!');
} catch (e) {
  console.log('sleepInBed note:', e.message);
  const bed2 = bot.blockAt(new Vec3(293, 72, -56)) || bot.blockAt(new Vec3(294, 72, -55));
  if (bed2) {
    try {
      await bot.activateBlock(bed2);
      console.log('Bed manually activated at:', bed2.position);
    } catch (e2) {}
  }
}

// Wait for morning (timeOfDay resets to 0..1000)
for (let s = 0; s < 15; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.time.timeOfDay < 1000 || bot.time.timeOfDay > 23000) {
    console.log('Morning arrived! Time:', bot.time.timeOfDay);
    break;
  }
}

// 5. Exit base to Nether portal
console.log('Exiting base to Nether portal...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting into Nether portal at (299.5, 73, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
}

// 6. Wait for Nether warp
const startDim = bot.game.dimension;
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}`);
    break;
  }
}

// 7. Step into bunker & march to frontline
if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (42, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
  console.log('Safely in Nether bunker at:', lib.fmt(bot.entity.position));

  console.log('Marching along proven East Ridge waypoints to Delta at Frontline...');
  const waypoints = [
    { name: 'Ridge South', pos: new Vec3(62.5, 66, -30) },
    { name: 'Ridge Mid-South', pos: new Vec3(62.5, 66, -55) },
    { name: 'Ridge Mid-North', pos: new Vec3(62.5, 67, -80) },
    { name: 'Ridge North Bend', pos: new Vec3(61.5, 66, -100) },
    { name: 'Fortress Approach', pos: new Vec3(50.0, 65, -115) },
    { name: 'Fortress Workshop Bunker', pos: new Vec3(44.0, 65, -127) },
    { name: 'Covered Tunnel Mid', pos: new Vec3(44.0, 65, -145) },
    { name: 'Covered Tunnel North', pos: new Vec3(44.0, 65, -160) },
    { name: 'Frontline Blast Wall', pos: new Vec3(44.0, 65, -169) }
  ];

  for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
    const wp = waypoints[i];
    console.log(`[WP ${i + 1}/${waypoints.length}] Moving to ${wp.name}...`);
    try {
      await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 2, { timeoutMs: 16000 });
    } catch (e) {
      try {
        await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 12000 });
      } catch (e2) {}
    }

    if (i >= 4) {
      try {
        await lib.pickup(6);
        await lib.equipArmor();
        await lib.equipWeapon();
      } catch (e) {}
    }
  }

  console.log('Frontline reached! Pos:', lib.fmt(bot.entity.position));
  console.log('Inv:', JSON.stringify(lib.inv()));
  bot.chat(`beta: United with Delta at Frontline (${lib.fmt(bot.entity.position)})! Ready to breach Spawner!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  time: bot.time.timeOfDay,
  inv: lib.inv()
};
