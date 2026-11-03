// programs/652-blaze-harvest-victory.js
console.log('=== Program 652: Shielded Pillbox Assault & Blaze Rod Victory ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Verify shield in offhand and weapon equipped
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
console.log('Offhand (slot 45):', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name);

// Step 1: In Overworld, sprint to Nether Portal (299.5, 73, -54)
if (bot.game.dimension === 'overworld') {
  console.log('Sprinting to Nether Portal (299.5, 73, -54)...');
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

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Step 2: In Nether, march to Pillbox
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether with Shield in off-hand! Marching directly to Spawner Pillbox (36.5, 66, -187)!');

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
    { x: 46, y: 65, z: -7 },
    { x: 54, y: 65, z: -7 },
    { x: 63, y: 64, z: -7 },
    { x: 63, y: 65, z: -20 },
    { x: 63, y: 66, z: -35 },
    { x: 62, y: 67, z: -50 },
    { x: 61, y: 67, z: -65 },
    { x: 62, y: 67, z: -80 },
    { x: 61, y: 66, z: -100 },
    { x: 50, y: 65, z: -115 },
    { x: 44, y: 65, z: -127 }, // Bunker
    { x: 44, y: 65, z: -145 }, // Tunnel
    { x: 44, y: 65, z: -160 },
    { x: 44, y: 65, z: -169 }, // Blast Wall
    { x: 38, y: 65, z: -176 }, // Cross Bridge
    { x: 36.5, y: 66, z: -187 }  // Pillbox
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

    if (wp.z <= -165) bot.setControlState('sneak', true);
    else bot.setControlState('sneak', false);

    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
      } catch (e2) {}
    }
    try { await lib.pickup(3.0); } catch (e) {}
  }
  bot.setControlState('sneak', false);

  console.log('Arrived at Pillbox! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

  // Step 3: Settle into stationary combat at (36.5, 66.0, -187.0)
  const distToPillbox = bot.entity.position.distanceTo(new Vec3(36.5, 66.0, -187.0));
  if (distToPillbox < 6.0) {
    bot.chat('alpha: Inside covered Spawner Pillbox (36.5, 66, -187) with Shield! Slaying Blazes for Milestone 8.');
    bot.pathfinder.stop();
    bot.pathfinder.setGoal(null);
    bot.clearControlStates();

    try {
      await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.0, 0.5));
    } catch (e) {}

    const farmDurationMs = 150000;
    const startTime = Date.now();
    let lastRods = lib.count('blaze_rod');
    let lastAttack = 0;
    let hits = 0;

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

      // Safe vacuum inside pillbox
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
        bot.chat(`alpha: MILESTONE 8 COMPLETE! We have ${curRods} Blaze Rods!`);
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
      await retreatToOverworldBase();
      if (bot.game.dimension === 'overworld') {
        try {
          await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
          bot.chat('alpha: Deposited all Blaze Rods in base chest (293, 72, -57)! Milestone 8 COMPLETE!');
        } catch (e) {}
      }
    }
  }
}

console.log('=== Program 652 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Rods:', lib.count('blaze_rod'), 'Inv:', lib.inv());
