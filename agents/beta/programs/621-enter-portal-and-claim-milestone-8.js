// programs/621-enter-portal-and-claim-milestone-8.js
console.log('=== Program 621: Step into Portal, March Nether Corridor & Harvest Blaze Rods ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- Phase 1: Walk directly inside the nether_portal block at (299.5, 73.0, -54.0) ---
console.log('Stepping directly inside nether_portal at (299.5, 73.0, -54.0)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
} catch (e) {
  try {
    await lib.goTo(299.5, 73.0, -54.0, 0.2, { dig: false });
  } catch (e2) {}
}

bot.clearControlStates();
bot.pathfinder.stop();

// Wait for dimension change into Nether
console.log('Standing inside portal frame, waiting for Nether warp...');
const startDim = bot.game.dimension;
for (let s = 0; s < 18; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim || bot.game.dimension.includes('nether')) {
    console.log(`SUCCESSFULLY WARPED TO THE NETHER! Dimension: ${bot.game.dimension}`);
    break;
  }
}

// --- Phase 2: Exit portal bunker and march safe waypoints ---
if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (42, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
  console.log('Safely in Nether bunker at:', lib.fmt(bot.entity.position));

  bot.chat('beta: In Nether bunker armed with stone sword & cobblestone! Advancing to Spawner!');

  console.log('Configuring strict fire, soul_fire & lava avoidance...');
  const moves = new Movements(bot, mcData);
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = false;
  bot.pathfinder.setMovements(moves);

  const safeWaypoints = [
    new Vec3(46, 65, -8),
    new Vec3(52, 65, -8),
    new Vec3(63, 64, -8),
    new Vec3(63, 66, -20),
    new Vec3(63, 66, -35),
    new Vec3(62, 67, -50),
    new Vec3(61, 67, -65),
    new Vec3(62, 67, -80),
    new Vec3(61, 66, -100),
    new Vec3(50, 65, -115),
    new Vec3(44, 65, -127), // Fortress Workshop Outpost
    new Vec3(44, 65, -145), // Covered tunnel mid
    new Vec3(44, 65, -160), // Covered tunnel north
    new Vec3(44, 65, -169), // Frontline blast wall
    new Vec3(44, 65, -176), // Cross-bridge junction
    new Vec3(38, 65, -176), // Sealed cross-bridge
    new Vec3(38, 65, -178), // Corner turn
    new Vec3(37, 65, -184)  // North walkway end
  ];

  for (let i = 0; i < safeWaypoints.length && !isCancelled(); i++) {
    const wp = safeWaypoints[i];
    console.log(`[WP ${i + 1}/${safeWaypoints.length}] Moving to (${wp.x}, ${wp.y}, ${wp.z})...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
    } catch (e) {
      console.log(`Path note to WP ${i + 1}:`, e.message);
    }
  }

  console.log('At front! Current pos:', lib.fmt(bot.entity.position));

  // --- Phase 3: Bridge 2-block gap to Spawner Balcony deck ---
  if (lib.count('cobblestone') > 0) {
    console.log('Placing bridge steps to deck at (35, 67, -187)...');
    try { await lib.place('cobblestone', 36, 65, -185); } catch (e) {}
    try { await lib.place('cobblestone', 36, 66, -186); } catch (e) {}
    try { await lib.place('cobblestone', 35, 67, -187); } catch (e) {}
  }

  console.log('Stepping onto Spawner Balcony deck...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(34, 67, -187, 1));
    console.log('SUCCESS: On Spawner Balcony Deck at:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Balcony step note:', e.message);
  }

  // --- Phase 4: Slay Blazes & Harvest Blaze Rods ---
  console.log('--- Phase 4: Slaying Blazes & Harvesting Blaze Rods ---');
  let rounds = 0;
  while (rounds < 50 && !isCancelled()) {
    rounds++;
    const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 5.5);
    if (blaze) {
      console.log(`Attacking Blaze at dist ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m...`);
      await lib.equipWeapon();
      await bot.lookAt(blaze.position.offset(0, 1.0, 0), true);
      bot.attack(blaze);
      await sleep(600);
    } else {
      await sleep(400);
    }

    const gained = await lib.pickup(6);
    if (gained > 0) {
      console.log('Picked up items! Blaze rods:', lib.count('blaze_rod'));
    }

    if (lib.count('blaze_rod') >= 7) {
      console.log('*** MILESTONE 8 ACHIEVED: 7+ BLAZE RODS ***');
      bot.chat(`beta: MILESTONE 8 COMPLETE! Harvested ${lib.count('blaze_rod')} Blaze Rods!`);
      break;
    }
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
