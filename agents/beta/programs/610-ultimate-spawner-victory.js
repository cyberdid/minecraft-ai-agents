// programs/610-ultimate-spawner-victory.js
console.log('=== Step: Harvest Wood, Mine 32 Cobble, Bridge Spawner & Slay Blazes ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- PART 1: OVERWORLD GEARUP ---
if (bot.game.dimension === 'overworld') {
  // Exit base door
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}

  // Walk to birch tree at (317, 69, -68)
  console.log('Walking to birch tree at (317, 69, -68)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(317, 69, -67, 1.5));
  } catch (e) {
    try { await lib.goToXZ(317, -67); } catch (e2) {}
  }

  for (let y of [69, 70, 71, 72]) {
    const b = bot.blockAt(new Vec3(317, y, -68));
    if (b && b.name.includes('log')) {
      try { await lib.dig(317, y, -68); } catch (e) {}
    }
  }
  await lib.pickup(4);
  console.log('Logs collected:', lib.count('*_log'));

  // Craft planks, sticks, wooden pickaxe
  const logCount = lib.count('*_log');
  if (logCount > 0) {
    try { await lib.craft('birch_planks', logCount * 4); } catch (e) {}
  }
  if (lib.count('stick') < 4) {
    try { await lib.craft('stick', 4); } catch (e) {}
  }
  if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
    await lib.craft('wooden_pickaxe', 1);
  }

  // Walk to mine shaft at (301, 71, -44)
  console.log('Walking to mine shaft at (301, 71, -44)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 1));
  } catch (e) {
    await lib.goTo(301, 71, -44, 1, { dig: false });
  }

  // Mine 3 stone for stone pickaxe
  for (let s = 0; s < 6; s++) {
    if (lib.count('cobblestone') >= 3) break;
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

  if (lib.count('cobblestone') >= 3) {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    if (lib.count('stone_pickaxe') < 1) await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted!');
  }

  // Mine 32 cobblestone
  console.log('Mining 32 cobblestone...');
  let digs = 0;
  while (lib.count('cobblestone') < 32 && digs < 40 && !isCancelled()) {
    digs++;
    const stone = bot.findBlock({
      matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id, mcData.blocksByName.andesite?.id].filter(Boolean),
      maxDistance: 4,
      useExtraInfo: (b) => b.position.y <= 71 && (b.position.x >= 298 || b.position.z >= -48)
    });
    if (stone) {
      try {
        await lib.dig(stone.position.x, stone.position.y, stone.position.z);
        await lib.pickup(3);
      } catch (e) {
        break;
      }
    } else {
      break;
    }
  }

  if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') < 1) {
    if (lib.count('stick') < 1) await lib.craft('stick', 4);
    await lib.craft('stone_sword', 1);
    await lib.equipWeapon();
    console.log('Stone sword crafted and equipped!');
  }

  console.log('Cobblestone ready:', lib.count('cobblestone'), 'Inv:', JSON.stringify(lib.inv()));
  await lib.equipWeapon();

  // Sprint into Nether portal at (299.5, 73, -54)
  const portalTarget = new Vec3(299.5, 73.0, -54.0);
  console.log('Sprinting into Nether portal...');
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

// --- PART 2: NETHER MARCH WITH CUSTOM FIRE AVOIDANCE ---
if (bot.game.dimension.includes('nether')) {
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

  console.log('At (37, 65, -184)! Current pos:', lib.fmt(bot.entity.position));

  // --- PART 3: BRIDGE THE 2-BLOCK GAP TO SPAWNER BALCONY ---
  console.log('Bridging across gap to Spawner Balcony at (35, 67, -187)...');
  // Place step 1 at (36, 65, -185)
  try {
    await lib.place('cobblestone', 36, 65, -185);
    console.log('Placed step 1 at (36, 65, -185)!');
  } catch (e) {
    console.log('Step 1 note:', e.message);
  }

  // Place step 2 at (36, 66, -186)
  try {
    await lib.place('cobblestone', 36, 66, -186);
    console.log('Placed step 2 at (36, 66, -186)!');
  } catch (e) {
    console.log('Step 2 note:', e.message);
  }

  // Place connection at (35, 67, -187)
  try {
    await lib.place('cobblestone', 35, 67, -187);
    console.log('Placed connection at (35, 67, -187)!');
  } catch (e) {
    console.log('Step 3 note:', e.message);
  }

  // Step onto Spawner Balcony deck!
  console.log('Stepping onto Spawner Balcony deck at (34, 67, -187)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(34, 67, -187, 1));
    console.log('SPAWNER BALCONY DECK REACHED!');
  } catch (e) {
    console.log('Deck step note:', e.message);
  }

  // --- PART 4: COMBAT & BLAZE ROD FARMING ---
  console.log('Engaging Blazes safely from cover...');
  let rounds = 0;
  while (rounds < 35 && !isCancelled()) {
    rounds++;
    const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 5);
    if (blaze) {
      console.log(`Striking Blaze at dist ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m...`);
      await lib.equipWeapon();
      await bot.lookAt(blaze.position.offset(0, 1.0, 0), true);
      bot.attack(blaze);
      await sleep(650);
    } else {
      await sleep(400);
    }

    // Collect drops
    const gained = await lib.pickup(6);
    if (gained > 0) {
      console.log('Drops picked up! Current blaze_rods:', lib.count('blaze_rod'));
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
