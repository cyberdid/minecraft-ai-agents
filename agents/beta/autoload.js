// beta/autoload.js
// Custom overrides and battle-tested helpers for Beta

// Configure pathfinder to strictly avoid fire, soul fire, and lava, and disallow dangerous parkour
globalThis.configureFireAvoidance = function () {
  if (!bot.pathfinder || !mcData) return;
  const moves = new Movements(bot, mcData);
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);
  console.log('Pathfinder movements updated: fire, soul_fire, lava blocked, parkour off!');
};

// Punch out fire and soul_fire blocks ahead within 4.5m
globalThis.clearFireAhead = async function () {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 4.5,
    count: 5
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b, true);
    } catch (e) {}
  }
};

// Robust enterNetherPortal: enters portal at (299.5, 73.0, -54.0) and stands still until warped
globalThis.enterNetherPortal = async function(timeoutMs = 25000) {
  if (bot.game.dimension === 'the_nether') return { dimension: 'the_nether', pos: bot.entity.position };
  
  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -54.0, 0.8));
  } catch (e) {
    try { await lib.goToXZ(299.5, -54.0, { timeoutMs: 8000 }); } catch (e2) {}
  }
  
  const target = new Vec3(299.5, 73.0, -54.0);
  if (bot.entity.position.distanceTo(target) > 0.8) {
    await bot.lookAt(target, true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
    await sleep(800);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  const start = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - start < timeoutMs) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - 299.5) > 0.6 || Math.abs(cur.z - (-54.0)) > 0.6 || cur.y < 72.8) {
      await bot.lookAt(target, true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(300);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(300);
  }
  
  bot.clearControlStates();
  if (bot.game.dimension === 'the_nether') {
    await sleep(400);
    // Step forward out of portal into bunker
    if (bot.entity.position.distanceTo(new Vec3(40, 65, -7)) < 5.0) {
      await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
      bot.setControlState('forward', true);
      await sleep(1000);
      bot.setControlState('forward', false);
    }
  }
  return { dimension: bot.game.dimension, pos: bot.entity.position };
};

// 19 safe waypoints avoiding fire field and lethal cliff drops
globalThis.NETHER_PILLBOX_WAYPOINTS = [
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
  { x: 44, y: 65, z: -127 }, // Bunker
  { x: 44, y: 65, z: -145 }, // Covered tunnel
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -169 }, // Blast wall
  { x: 38, y: 65, z: -176 }, // Cross bridge
  { x: 36.5, y: 66, z: -187 } // Pillbox
];

// Robust marchToSpawnerPillbox: handles dimension warp, punches fire, and marches with shield
globalThis.marchToSpawnerPillbox = async function() {
  if (bot.game.dimension === 'overworld') {
    await globalThis.enterNetherPortal();
  }
  if (bot.game.dimension !== 'the_nether') {
    throw new Error('Not in the_nether after enterNetherPortal');
  }
  globalThis.configureFireAvoidance();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  let startIdx = 0;
  for (let i = 0; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length; i++) {
    const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
    if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
      startIdx = i + 1;
    }
  }

  console.log(`Marching to Pillbox from WP ${startIdx}/${globalThis.NETHER_PILLBOX_WAYPOINTS.length}...`);

  for (let i = startIdx; i < globalThis.NETHER_PILLBOX_WAYPOINTS.length; i++) {
    if (bot.game.dimension !== 'the_nether') break;

    await globalThis.clearFireAhead();

    const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 2.0) continue;

    // Past z=-165: sneak + raise shield facing ahead
    if (wp.z <= -165) {
      bot.setControlState('sneak', true);
      bot.activateItem(true);
    } else {
      bot.setControlState('sneak', false);
      bot.deactivateItem();
    }

    // Keep gaze low to avoid Enderman aggro
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try {
        await globalThis.clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
      } catch (e2) {}
    }

    await globalThis.clearFireAhead();
    try { await lib.pickup(3.0); } catch (e) {}

    if (bot.health <= 7) {
      console.log(`Health low (${bot.health}) during march at WP ${i + 1}, holding in cover.`);
      break;
    }
  }

  bot.setControlState('sneak', false);
  return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health, rods: lib.count('blaze_rod') };
};

// Robust farmBlazeRodsAtPillbox: stationary combat with active shield raising/lowering
globalThis.farmBlazeRodsAtPillbox = async function(targetRods = 8, durationMs = 120000) {
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // Settle into pillbox position
  try {
    await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.5));
  } catch (e) {}

  const start = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let hits = 0;
  let killed = 0;

  console.log(`Farming Blazes at Pillbox with Active Shield! Initial rods: ${lastRods}/${targetRods}, HP: ${bot.health}`);
  bot.activateItem(true); // Raise shield by default

  while (Date.now() - start < durationMs && bot.game.dimension === 'the_nether') {
    if (bot.health <= 6) {
      console.log(`HP low (${bot.health}), maintaining shield defense...`);
      bot.activateItem(true);
      await sleep(1000);
      continue;
    }

    // Keep position locked inside pillbox
    if (bot.entity.position.distanceTo(new Vec3(36.5, 66.0, -187.0)) > 1.2) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.4));
      } catch (e) {}
    }

    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      // Face target to block fireballs with shield
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

      // Strike if in melee range (<= 4.5m)
      if (dist <= 4.5 && Date.now() - lastAttack > 650) {
        bot.deactivateItem(); // Lower shield
        try { await lib.equipWeapon(); } catch (e) {}
        bot.attack(target);
        lastAttack = Date.now();
        hits++;
        bot.activateItem(true); // Re-raise shield immediately!
        if (target.health !== undefined && target.health <= 0) {
          killed++;
          console.log(`Blaze slain! Kills: ${killed}`);
        }
      } else {
        bot.activateItem(true); // Shield raised
      }
    } else {
      // Face spawner at (32, 68, -190) with shield raised
      await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
      bot.activateItem(true);
    }

    // Safe vacuum inside pillbox
    const safeItems = Object.values(bot.entities).filter(e =>
      e.name === 'item' &&
      bot.entity.position.distanceTo(e.position) <= 2.5 &&
      e.position.x >= 35.5 &&
      e.position.z <= -185.0
    );
    for (const item of safeItems) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.4));
      } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`Beta: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
      console.log(`Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
      lastRods = curRods;
    }

    if (curRods >= targetRods) {
      bot.chat(`Beta: Milestone 8 COMPLETED! ${curRods} Blaze Rods secured!`);
      break;
    }

    await sleep(100);
  }

  bot.deactivateItem();
  const finalRods = lib.count('blaze_rod');
  console.log(`Pillbox combat end. Rods: ${finalRods}/${targetRods}, Hits: ${hits}, Kills: ${killed}, HP: ${bot.health}`);
  return { killed, rods: finalRods, hp: bot.health, pos: bot.entity.position };
};

// Robust retreatToOverworldBase: walks back from Pillbox through Nether Portal to base chest
globalThis.retreatToOverworldBase = async function() {
  if (bot.game.dimension === 'the_nether') {
    globalThis.configureFireAvoidance();
    const rev = [...globalThis.NETHER_PILLBOX_WAYPOINTS].reverse();
    for (const wp of rev) {
      const v = new Vec3(wp.x, wp.y, wp.z);
      if (bot.entity.position.distanceTo(v) < 2.5) continue;
      try { await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 8000 }); } catch (e) {}
    }
    const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
    if (portalBlock) {
      await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      await sleep(1500);
      bot.setControlState('forward', false);
      const warpStart = Date.now();
      while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000) {
        await sleep(300);
      }
    }
  }
  if (bot.game.dimension === 'overworld') {
    try { await lib.goTo(293, 72, -55, 2, { timeoutMs: 12000 }); } catch (e) {}
  }
  return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health, rods: lib.count('blaze_rod') };
};
