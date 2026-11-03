// programs/426-expedition-to-spawner.js
globalThis.isCancelled = isCancelled;

console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Ensure weapon is equipped
try { await lib.equipWeapon(); } catch (e) {}

// 2. Navigate out of base to portal if in overworld
if (bot.game.dimension === 'overworld') {
  // Check for any closed doors blocking exit
  const doorIds = Object.keys(mcData.blocksByName).filter(k => k.endsWith('_door')).map(k => mcData.blocksByName[k].id);
  const doors = bot.findBlocks({ matching: doorIds, maxDistance: 6, count: 2 });
  for (const d of doors) {
    const b = bot.blockAt(d);
    // Open door if closed
    if (b && !b._properties?.open) {
      console.log(`Opening door at ${lib.fmt(d)}...`);
      try { await bot.activateBlock(b); } catch (e) {}
    }
  }

  console.log('Walking to portal approach (298, 72, -54)...');
  try {
    await lib.goTo(298, 72, -54, 1.5, { timeoutMs: 15000 });
  } catch (e) {
    console.log('lib.goTo portal note:', e.message);
  }

  console.log('Stepping into portal center (299.5, 73.0, -54.0)...');
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  const portalCenter = new Vec3(299.5, 73.0, -54.0);
  await bot.lookAt(portalCenter, true);
  bot.setControlState('forward', true);
  await sleep(700);
  bot.setControlState('forward', false);

  console.log('Standing still inside portal to let warp trigger...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
    await sleep(500);
    if (bot.game.dimension === 'the_nether') break;
    const cur = bot.entity.position;
    if (cur.distanceTo(portalCenter) > 0.8) {
      await bot.lookAt(portalCenter, true);
      bot.setControlState('forward', true);
      await sleep(250);
      bot.setControlState('forward', false);
    }
  }
}

console.log('Dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat('delta: In Nether at full 20 HP! Marching to Spawner Pillbox (36, 66, -187)...');

  // Step out of Nether portal bunker
  await bot.lookAt(new Vec3(45.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);

  // Configure movements with strict fire avoidance
  const moves = new Movements(bot, mcData);
  const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
  for (const id of fireIds) moves.blocksToAvoid.add(id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);

  const WAYPOINTS = [
    { x: 46, y: 65, z: -7 },   // 0
    { x: 54, y: 65, z: -7 },   // 1
    { x: 63, y: 64, z: -7 },   // 2
    { x: 63, y: 65, z: -20 },  // 3
    { x: 63, y: 66, z: -35 },  // 4
    { x: 62, y: 67, z: -50 },  // 5
    { x: 61, y: 67, z: -65 },  // 6
    { x: 62, y: 67, z: -80 },  // 7
    { x: 61, y: 66, z: -100 }, // 8
    { x: 50, y: 65, z: -115 }, // 9
    { x: 44, y: 65, z: -127 }, // 10
    { x: 44, y: 65, z: -145 }, // 11
    { x: 44, y: 65, z: -160 }, // 12
    { x: 44, y: 65, z: -169 }, // 13
    { x: 38, y: 65, z: -176 }, // 14
    { x: 36, y: 66, z: -187 }  // 15
  ];

  let startIdx = 0;
  for (let i = 0; i < WAYPOINTS.length; i++) {
    if (bot.entity.position.distanceTo(new Vec3(WAYPOINTS[i].x, WAYPOINTS[i].y, WAYPOINTS[i].z)) < 3.5) {
      startIdx = i + 1;
    }
  }

  console.log(`Starting march from WP ${startIdx}...`);
  for (let i = startIdx; i < WAYPOINTS.length && !isCancelled(); i++) {
    const wp = WAYPOINTS[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 2.5) continue;

    console.log(`Marching to WP ${i} (${wp.x}, ${wp.y}, ${wp.z})...`);
    try {
      let timer;
      await Promise.race([
        bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8)),
        new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), 12000); })
      ]);
      clearTimeout(timer);
    } catch (e) {
      clearTimeout(timer);
      console.log(`WP ${i} fallback walk...`);
      try {
        await bot.lookAt(target.offset(0.5, 1, 0.5), true);
        bot.setControlState('forward', true);
        if (target.y > bot.entity.position.y) bot.setControlState('jump', true);
        await sleep(1500);
        bot.setControlState('jump', false);
        bot.setControlState('forward', false);
      } catch (e2) {}
    }

    try { await lib.pickup(3.0); } catch (e) {}

    if (bot.health <= 7) {
      console.log(`Health low (${bot.health.toFixed(1)}), holding position in covered corridor.`);
      break;
    }
  }

  console.log('Arrived at front. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

  // Check if at Pillbox
  const distToPillbox = bot.entity.position.distanceTo(new Vec3(36, 66, -187));
  if (distToPillbox < 6.0) {
    bot.chat('delta: Standing in Spawner Pillbox! Engaging Blazes for Blaze Rods.');
    bot.pathfinder.stop();
    bot.pathfinder.setGoal(null);
    bot.clearControlStates();

    // Settle in stationary cover spot behind firing slit
    try {
      await bot.pathfinder.goto(new goals.GoalNear(37, 66, -186, 0.8));
    } catch (e) {}

    const farmDurationMs = 120000;
    const startTime = Date.now();
    let lastRods = lib.count('blaze_rod');
    let lastAttack = 0;
    let killed = 0;

    console.log(`Blaze combat active. Starting rods: ${lastRods}`);

    while (!isCancelled() && Date.now() - startTime < farmDurationMs) {
      if (bot.health <= 7) {
        console.log(`HP low (${bot.health.toFixed(1)}), retreating to covered tunnel at (44, 65, -169)!`);
        bot.chat('delta: HP low, retreating to covered tunnel!');
        try {
          await bot.pathfinder.goto(new goals.GoalNear(44, 65, -169, 1.5));
        } catch (e) {}
        break;
      }

      if (bot.food < 16) {
        try { await lib.eat(); } catch (e) {}
      }

      // Attack closest blaze within 5.0m
      const blazes = Object.values(bot.entities)
        .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
        .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

      const target = blazes[0];
      if (target) {
        const dist = bot.entity.position.distanceTo(target.position);
        if (dist <= 5.0 && Date.now() - lastAttack > 625) {
          try { await lib.equipWeapon(); } catch (e) {}
          await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
          bot.attack(target);
          lastAttack = Date.now();
          console.log(`Hit Blaze at dist ${dist.toFixed(1)}m (target HP: ${target.health})`);
          if (target.health !== undefined && target.health <= 0) killed++;
        }
      }

      // Safe pickup (stay >= 35.5)
      if (bot.entity.position.x >= 35.5 && Math.random() < 0.3) {
        try { await lib.pickup(3.0); } catch (e) {}
      }

      const curRods = lib.count('blaze_rod');
      if (curRods > lastRods) {
        bot.chat(`delta: Harvested Blaze Rod! Total: ${curRods}/8`);
        console.log(`Harvested Blaze Rod! Total: ${curRods}/8`);
        lastRods = curRods;
      }

      if (curRods >= 8) {
        console.log('Milestone 8 target reached: 8+ Blaze Rods!');
        break;
      }

      await sleep(150);
    }

    try { if (bot.entity.position.x >= 35.5) await lib.pickup(3.5); } catch (e) {}

    const totalRods = lib.count('blaze_rod');
    console.log(`Combat cycle end. Total rods: ${totalRods}/8, HP: ${bot.health}`);
    bot.chat(`delta: Farming cycle complete. Blaze Rods held: ${totalRods}/8, HP: ${bot.health.toFixed(1)}`);

    if (totalRods >= 8) {
      bot.chat('delta: 8+ Blaze Rods secured! Retreating to Overworld base to deposit.');
      console.log('Retreating to Overworld base...');
      const retRes = await retreatToOverworldBase();
      console.log('Retreat result:', JSON.stringify(retRes));

      // Deposit into base chest
      if (bot.game.dimension === 'overworld') {
        try {
          await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
          bot.chat('delta: Deposited all Blaze Rods in base chest (293, 72, -57)! Milestone 8 COMPLETE!');
        } catch (e) {
          console.log('Deposit error:', e.message);
        }
      }
    }
  }
}
