// programs/608-sprint-base-and-blaze-harvest.js
console.log('=== Step: Sprint to Base, Gear Up & Farm Blaze Rods at Spawner ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- PART 1: SPRINT TO BASE & GEAR UP ---
if (bot.game.dimension === 'overworld') {
  console.log('Sprinting East to base...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(230, 68, -65, 3));
  } catch (e) {
    try { await lib.goToXZ(230, -65); } catch (e2) {}
  }

  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 2));
  } catch (e) {
    try { await lib.goToXZ(294, -54); } catch (e2) {}
  }

  // Enter Base and lock spawn
  console.log('Entering base and locking spawn...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}

  try {
    await lib.setSpawn();
    console.log('Spawn locked at base bed!');
  } catch (e) {}

  // Check chest for existing weapons / tools
  try {
    const cb = bot.blockAt(new Vec3(293, 72, -57));
    if (cb) {
      const c = await bot.openContainer(cb);
      for (const item of c.containerItems()) {
        if (['stone_sword', 'iron_sword', 'stone_pickaxe', 'iron_pickaxe', 'shield', 'cobblestone', 'cooked_porkchop', 'bread'].includes(item.name)) {
          console.log(`Withdrawing ${item.name} x${item.count}...`);
          try { await c.withdraw(item.type, null, item.count); } catch (e) {}
        }
      }
      c.close();
    }
  } catch (e) {}

  // If no sword, harvest 3 birch logs and craft
  if (lib.count('*_sword') < 1) {
    console.log('Harvesting 3 birch logs at (317, 69, -68)...');
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

    // Mine stone for sword
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

// --- PART 2: NETHER MARCH WITH STRICT FIRE AVOIDANCE ---
if (bot.game.dimension.includes('nether')) {
  // Activate fire avoidance!
  if (typeof configureFireAvoidance === 'function') {
    configureFireAvoidance();
  }

  console.log('Marching along proven East Ridge waypoints to Frontline...');
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
  await lib.pickup(6);
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // Advance to z=-176 and across cross-bridge to Spawner Balcony
  console.log('Advancing along Delta sealed bridge to Spawner Balcony at (34, 67, -187)...');
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -176));
    await bot.pathfinder.goto(new goals.GoalBlock(38, 65, -176));
    await bot.pathfinder.goto(new goals.GoalBlock(37, 65, -184));
    await bot.pathfinder.goto(new goals.GoalNear(34, 67, -187, 1.5));
  } catch (e) {
    console.log('Bridge navigation note:', e.message);
  }

  console.log('Spawner Balcony reached! Pos:', lib.fmt(bot.entity.position));
  bot.chat(`beta: On Spawner Balcony (${lib.fmt(bot.entity.position)})! Engaging Blazes!`);

  // --- PART 3: COMBAT & BLAZE ROD HARVEST ---
  console.log('Engaging Blazes safely...');
  let attackRounds = 0;
  while (attackRounds < 20 && !isCancelled()) {
    attackRounds++;
    const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 5);
    if (blaze) {
      console.log(`Striking Blaze id=${blaze.id} at dist=${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m!`);
      await lib.equipWeapon();
      await bot.lookAt(blaze.position.offset(0, 1.0, 0), true);
      bot.attack(blaze);
      await sleep(650);
    } else {
      await sleep(500);
    }
    // Collect drops
    const gained = await lib.pickup(6);
    if (gained > 0) {
      console.log('Drops picked up! Current blaze_rods:', lib.count('blaze_rod'));
    }
    if (lib.count('blaze_rod') >= 7) {
      console.log('MILESTONE 8 ACHIEVED: 7+ BLAZE RODS HARVESTED!');
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
