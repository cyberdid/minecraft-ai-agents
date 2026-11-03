// programs/622-reclaim-gear-and-spawner-victory.js
console.log('=== Program 622: Sprint to Frontline, Reclaim Gear & Complete Milestone 8 ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- Phase 1: Exit Base & Dig 4 Dirt for emergency shielding ---
console.log('--- Phase 1: Exit Base & Gather Quick Blocks ---');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Outside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door pass note:', e.message);
}

// Dig 4 dirt near portal
for (let d = 0; d < 4; d++) {
  const dirtB = bot.findBlock({
    matching: mcData.blocksByName.dirt.id,
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y <= 72 && (b.position.x >= 298 || b.position.z >= -52)
  });
  if (dirtB) {
    try {
      await lib.dig(dirtB.position.x, dirtB.position.y, dirtB.position.z);
      await lib.pickup(3);
    } catch (e) {}
  }
}
console.log('Blocks ready:', lib.count('dirt'), 'Inv:', JSON.stringify(lib.inv()));

// --- Phase 2: Sprint directly into Nether portal frame at (299.5, 73.0, -54.0) ---
console.log('--- Phase 2: Sprinting into Nether portal ---');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
} catch (e) {
  try { await lib.goTo(299.5, 73.0, -54.0, 0.2, { dig: false }); } catch (e2) {}
}

bot.clearControlStates();
bot.pathfinder.stop();

console.log('Waiting for Nether warp...');
const startDim = bot.game.dimension;
for (let s = 0; s < 18; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim || bot.game.dimension.includes('nether')) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}`);
    break;
  }
}

// --- Phase 3: Fast March through Proven Safe Waypoints to Frontline ---
if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (42, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
  console.log('Safely in Nether bunker at:', lib.fmt(bot.entity.position));

  bot.chat('beta: Sprinting Nether corridor to Spawner Frontline to reclaim gear and farm Blaze Rods!');

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
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
    } catch (e) {}
  }

  console.log('At front! Moving onto Spawner Balcony deck...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(34, 67, -186, 1));
  } catch (e) {}

  // --- Phase 4: Reclaim Dropped Items & Equip Weapon ---
  console.log('--- Phase 4: Reclaiming Dropped Gear ---');
  await lib.pickup(8);
  console.log('Recovered items! Current inv:', JSON.stringify(lib.inv()));
  await lib.equipArmor();
  await lib.equipWeapon();

  // --- Phase 5: Build Protective Strike Battlement at (33, 68, -188) ---
  console.log('--- Phase 5: Reinforcing Firing Slit Battlement ---');
  if (lib.count('cobblestone') > 0 || lib.count('dirt') > 0) {
    const blockType = lib.count('cobblestone') > 0 ? 'cobblestone' : 'dirt';
    try {
      // Place high block at y=68 to cover head from fireballs
      await lib.place(blockType, 33, 68, -188);
      console.log('Head cover placed at (33, 68, -188)!');
    } catch (e) {}
    try {
      await lib.place(blockType, 34, 68, -188);
      console.log('Head cover placed at (34, 68, -188)!');
    } catch (e) {}
  }

  // --- Phase 6: Slay Blazes from Safe Cover & Harvest 7+ Blaze Rods ---
  console.log('--- Phase 6: Slaying Blazes from Cover ---');
  let rounds = 0;
  while (rounds < 60 && !isCancelled()) {
    rounds++;
    // Attack blazes through slit
    const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 5.5);
    if (blaze) {
      console.log(`Striking Blaze at dist ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m...`);
      await lib.equipWeapon();
      await bot.lookAt(blaze.position.offset(0, 0.5, 0), true); // aim at lower half / legs
      bot.attack(blaze);
      await sleep(650);
    } else {
      await sleep(400);
    }

    const gained = await lib.pickup(6);
    if (gained > 0) {
      console.log('Items collected! Blaze rods:', lib.count('blaze_rod'));
    }

    if (lib.count('blaze_rod') >= 7) {
      console.log('====================================');
      console.log('MILESTONE 8 COMPLETE! 7+ BLAZE RODS!');
      console.log('====================================');
      bot.chat(`beta: MILESTONE 8 COMPLETE! Harvested ${lib.count('blaze_rod')} Blaze Rods from Spawner!`);
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
