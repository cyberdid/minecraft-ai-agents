// programs/609-safe-march-and-spawner-victory.js
console.log('=== Step: Sprint to Base, Re-Arm, Safe Nether March & Blaze Rod Harvest ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- PART 1: SPRINT TO BASE & RE-ARM ---
if (bot.game.dimension === 'overworld') {
  console.log('Sprinting straight East along z=-55 to Base...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(235, 68, -55, 3));
  } catch (e) {
    try { await lib.goToXZ(235, -55); } catch (e2) {}
  }

  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 2));
  } catch (e) {
    try { await lib.goToXZ(294, -54); } catch (e2) {}
  }

  // Enter base door
  console.log('Entering base...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}

  // Lock spawn at bed
  try {
    await lib.setSpawn();
    console.log('Spawn locked at base bed!');
  } catch (e) {}

  // Check chest for weapons / cobblestone
  try {
    const cb = bot.blockAt(new Vec3(293, 72, -57));
    if (cb) {
      const c = await bot.openContainer(cb);
      console.log('Base chest items:', c.containerItems().map(i => `${i.name}x${i.count}`));
      for (const item of c.containerItems()) {
        if (['stone_sword', 'iron_sword', 'stone_pickaxe', 'iron_pickaxe', 'shield', 'cobblestone', 'cooked_porkchop', 'bread'].includes(item.name)) {
          console.log(`Withdrawing ${item.name} x${item.count}...`);
          try { await c.withdraw(item.type, null, item.count); } catch (e) {}
        }
      }
      c.close();
    }
  } catch (e) {}

  // If no sword, harvest tree and craft stone sword
  if (lib.count('*_sword') < 1) {
    console.log('Harvesting 3 logs to craft stone sword...');
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
    try {
      await bot.pathfinder.goto(new goals.GoalNear(317, 69, -67, 2));
      for (let y of [69, 70, 71]) {
        const b = bot.blockAt(new Vec3(317, y, -68));
        if (b && b.name.includes('log')) {
          try { await lib.dig(317, y, -68); } catch (e) {}
        }
      }
      await lib.pickup(4);
    } catch (e) {}

    const logCount = lib.count('*_log');
    if (logCount > 0) {
      try { await lib.craft('birch_planks', logCount * 4); } catch (e) {}
    }
    if (lib.count('stick') < 4) {
      try { await lib.craft('stick', 4); } catch (e) {}
    }
    if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
      try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
    }

    // Mine stone at shaft
    try {
      await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 2));
      for (let s = 0; s < 5; s++) {
        if (lib.count('cobblestone') >= 2) break;
        const stone = bot.findBlock({
          matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id, mcData.blocksByName.andesite?.id].filter(Boolean),
          maxDistance: 4,
          useExtraInfo: (b) => b.position.y <= 71
        });
        if (stone) {
          try {
            await lib.dig(stone.position.x, stone.position.y, stone.position.z);
            await lib.pickup(3);
          } catch (e) {}
        }
      }
      if (lib.count('cobblestone') >= 2) {
        await lib.craft('stone_sword', 1);
        await lib.equipWeapon();
      }
    } catch (e) {}
  }

  // Sprint into Nether portal at (299.5, 73, -54)
  const portalTarget = new Vec3(299.5, 73.0, -54.0);
  console.log('Sprinting into Nether portal at (299.5, 73, -54)...');
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
  } catch (e) {
    await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
  }

  const startDim = bot.game.dimension;
  for (let s = 0; s < 12; s++) {
    await sleep(1000);
    if (isCancelled()) break;
    if (bot.game.dimension !== startDim) {
      console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}`);
      break;
    }
  }

  if (bot.game.dimension.includes('nether')) {
    console.log('Stepping East out of portal frame into bunker...');
    await bot.lookAt(new Vec3(46, 65, -7), true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.clearControlStates();
    console.log('Safely in Nether bunker at:', lib.fmt(bot.entity.position));
  }
}

// --- PART 2: NETHER MARCH WITH CUSTOM FIRE AVOIDANCE (NO LIB.GOTO!) ---
if (bot.game.dimension.includes('nether')) {
  console.log('Configuring strict fire, soul_fire & lava avoidance...');
  const moves = new Movements(bot, mcData);
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = false;
  bot.pathfinder.setMovements(moves);

  // Strict waypoints that keep z <= -8 to avoid soul fire patch at (57..64, -4..-16)
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
    new Vec3(37, 65, -184), // North walkway
    new Vec3(34, 67, -187)  // Delta's Spawner Balcony deck!
  ];

  console.log('Marching along safe waypoints...');
  for (let i = 0; i < safeWaypoints.length && !isCancelled(); i++) {
    const wp = safeWaypoints[i];
    console.log(`[WP ${i + 1}/${safeWaypoints.length}] Moving to (${wp.x}, ${wp.y}, ${wp.z})...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
    } catch (e) {
      console.log(`Path note to WP ${i + 1}:`, e.message);
    }

    if (i >= 5) {
      try {
        await lib.pickup(6);
        await lib.equipArmor();
        await lib.equipWeapon();
      } catch (e) {}
    }
  }

  console.log('Spawner Balcony reached! Pos:', lib.fmt(bot.entity.position));
  console.log('Inv:', JSON.stringify(lib.inv()));
  bot.chat(`beta: On Spawner Balcony (${lib.fmt(bot.entity.position)})! Engaging Blazes!`);

  // --- PART 3: COMBAT & BLAZE ROD HARVEST ---
  let rounds = 0;
  while (rounds < 30 && !isCancelled()) {
    rounds++;
    const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 5);
    if (blaze) {
      console.log(`Attacking Blaze at dist ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m...`);
      await lib.equipWeapon();
      await bot.lookAt(blaze.position.offset(0, 1.0, 0), true);
      bot.attack(blaze);
      await sleep(650);
    } else {
      await sleep(500);
    }

    // Pick up drops
    const gained = await lib.pickup(6);
    if (gained > 0) {
      console.log('Drops collected! blaze_rod count:', lib.count('blaze_rod'));
    }

    if (lib.count('blaze_rod') >= 7) {
      console.log('MILESTONE 8 COMPLETE! 7+ BLAZE RODS HARVESTED!');
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
