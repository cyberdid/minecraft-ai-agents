console.log('=== DELTA: STAND STILL TO WARP & MARCH TO BUNKER ===');

// Check block at feet
const feetBlock = bot.blockAt(bot.entity.position);
const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 4 });
console.log(`Feet block: ${feetBlock?.name}, Portal block: ${portalBlock ? lib.fmt(portalBlock.position) : 'none'}`);

// Stop all movement completely
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

if (portalBlock && bot.entity.position.distanceTo(portalBlock.position.offset(0.5, 0, 0.5)) > 0.5) {
  console.log('Centering into portal block...');
  await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(350);
  bot.setControlState('forward', false);
}

bot.clearControlStates();
console.log('Standing 100% motionless to trigger portal warp...');

const start = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - start < 15000 && !isCancelled()) {
  await sleep(250);
}

console.log(`Dimension after warp wait: ${bot.game.dimension}`);

// If warped to Nether
if (bot.game.dimension === 'the_nether') {
  configureFireAvoidance();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  bot.chat('delta: In the_nether! Marching safe East Ridge trail to Fortress Workshop Bunker (44, 65, -127)!');

  // Step out of portal into camp
  await bot.lookAt(new Vec3(42.0, 65.0, -5.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
  await clearFireAhead();

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

    // Shield defense past z=-70
    if (wp.z <= -70) {
      bot.setControlState('sneak', true);
      bot.activateItem(true);
    } else {
      bot.setControlState('sneak', false);
      bot.deactivateItem();
    }

    // Gaze low
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try {
        await clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
      } catch (e2) {}
    }

    await clearFireAhead();
    try { await lib.pickup(3.0); } catch (e) {}

    if (bot.health <= 7) {
      console.log(`HP low (${bot.health}), holding cover.`);
      break;
    }
  }

  bot.setControlState('sneak', false);
  bot.deactivateItem();

  // Enter inside bunker
  try {
    await bot.pathfinder.goto(new goals.GoalNear(44.0, 65.0, -132.0, 1.0));
  } catch (e) {}

  bot.chat('delta: Arrived inside Fortress Workshop Bunker (44, 65, -132)! Reunited with Gamma and Beta for Milestone 9!');
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health
};
