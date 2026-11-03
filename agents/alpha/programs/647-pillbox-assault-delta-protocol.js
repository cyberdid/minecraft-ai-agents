// programs/647-pillbox-assault-delta-protocol.js
console.log('=== Program 647: Pillbox Assault (Delta Tested Protocol) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// 1. Equip stone sword and verify shield
try { await lib.equipWeapon(); } catch (e) {}
try { await lib.equipArmor(); } catch (e) {}
console.log('Held weapon:', bot.heldItem?.name, 'Offhand (slot 45):', bot.inventory.slots[45]?.name);

// 2. If in Overworld, enter Nether Portal cleanly
if (bot.game.dimension === 'overworld') {
  console.log('Entering Nether Portal (299.5, 73, -54)...');
  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -54.0, 0.6));
  } catch (e) {}

  const portalBlock = new Vec3(299.5, 73.0, -54.0);
  if (bot.entity.position.distanceTo(portalBlock) > 0.8) {
    await bot.lookAt(portalBlock.offset(0, 0.5, 0), true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
    await sleep(600);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(400);
  }
}

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// 3. In Nether, march to Pillbox
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether with Shield! Fast marching to Spawner Pillbox (36.5, 66, -187) under covered roof!');

  // Step out of Nether portal frame into Base Camp
  if (bot.entity.position.distanceTo(new Vec3(40, 65, -7)) < 5.0) {
    await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
    bot.setControlState('forward', true);
    await sleep(1000);
    bot.setControlState('forward', false);
  }

  // Configure fire and lava avoidance
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
    { x: 36.5, y: 66, z: -187 }  // 15 (Inside Spawner Pillbox under roof)
  ];

  let startIdx = 0;
  for (let i = 0; i < WAYPOINTS.length; i++) {
    if (bot.entity.position.distanceTo(new Vec3(WAYPOINTS[i].x, WAYPOINTS[i].y, WAYPOINTS[i].z)) < 3.5) {
      startIdx = i + 1;
    }
  }

  console.log(`Marching from WP ${startIdx} to Pillbox...`);
  for (let i = startIdx; i < WAYPOINTS.length && !isCancelled(); i++) {
    const wp = WAYPOINTS[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 2.0) continue;

    let timer = null;
    try {
      await Promise.race([
        bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8)),
        new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), 10000); })
      ]);
    } catch (e) {
      try {
        await bot.lookAt(target.offset(0.5, 1, 0.5), true);
        bot.setControlState('forward', true);
        if (target.y > bot.entity.position.y) bot.setControlState('jump', true);
        await sleep(1500);
        bot.setControlState('jump', false);
        bot.setControlState('forward', false);
      } catch (e2) {}
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  console.log('March complete. Position:', lib.fmt(bot.entity.position), 'HP:', bot.health);

  // 4. Secure Stationary Combat at Pillbox (36.5, 66.0, -187.0)
  const distToPillbox = bot.entity.position.distanceTo(new Vec3(36.5, 66.0, -187.0));
  if (distToPillbox < 6.0) {
    bot.chat('alpha: Inside covered Spawner Pillbox (36.5, 66, -187)! Slaying Blazes for Milestone 8.');
    bot.pathfinder.stop();
    bot.pathfinder.setGoal(null);
    bot.clearControlStates();

    // Lock strictly into covered bunker spot: (36.5, 66.0, -187.0)
    try {
      await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.5));
    } catch (e) {}

    const farmDurationMs = 150000;
    const startTime = Date.now();
    let lastRods = lib.count('blaze_rod');
    let lastAttack = 0;
    let hits = 0;

    console.log(`Stationary Blaze slayer active under roof. Starting rods: ${lastRods}`);

    while (!isCancelled() && Date.now() - startTime < farmDurationMs) {
      // Find nearest blaze within 5.0m
      const blazes = Object.values(bot.entities)
        .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
        .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

      const target = blazes[0];
      if (target) {
        const dist = bot.entity.position.distanceTo(target.position);
        if (dist <= 4.8 && Date.now() - lastAttack > 625) {
          try { await lib.equipWeapon(); } catch (e) {}
          await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
          bot.attack(target);
          lastAttack = Date.now();
          hits++;
          console.log(`Hit Blaze at dist ${dist.toFixed(1)}m (hit #${hits})`);
        }
      }

      // Safe stationary vacuum: only inside pillbox (x >= 36.0, z <= -186.0)
      const safeItems = Object.values(bot.entities).filter(e => 
        e.name === 'item' &&
        bot.entity.position.distanceTo(e.position) <= 2.5 &&
        e.position.x >= 36.0 &&
        e.position.z <= -186.0
      );
      for (const item of safeItems) {
        try {
          await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.4));
        } catch (e) {}
      }

      const curRods = lib.count('blaze_rod');
      if (curRods > lastRods) {
        bot.chat(`alpha: Harvested Blaze Rod! Total: ${curRods}/8`);
        console.log(`Harvested Blaze Rod! Total: ${curRods}/8`);
        lastRods = curRods;
      }

      if (curRods >= 8) {
        console.log('Milestone 8 target reached: 8+ Blaze Rods!');
        break;
      }

      await sleep(150);
    }

    const totalRods = lib.count('blaze_rod');
    console.log(`Combat cycle end. Total hits: ${hits}, Rods: ${totalRods}/8, HP: ${bot.health}`);
    bot.chat(`alpha: Combat round complete. Blaze Rods held: ${totalRods}/8, HP: ${bot.health.toFixed(1)}`);

    if (totalRods >= 8) {
      bot.chat('alpha: 8+ Blaze Rods secured! Retreating to Overworld base.');
      console.log('Retreating to Overworld base...');
      const retRes = await retreatToOverworldBase();
      console.log('Retreat result:', JSON.stringify(retRes));

      if (bot.game.dimension === 'overworld') {
        try {
          await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
          bot.chat('alpha: Deposited all Blaze Rods in base chest (293, 72, -57)! Milestone 8 COMPLETE!');
        } catch (e) {}
      }
    }
  }
}

console.log('=== Program 647 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Rods:', lib.count('blaze_rod'), 'Inv:', lib.inv());
