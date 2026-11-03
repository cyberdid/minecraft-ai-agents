// programs/646-assault-pillbox.js
console.log('=== Program 646: Warp to Nether & Slay Blazes at Pillbox ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Equip shield in offhand and stone sword in main hand
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
console.log('Offhand (slot 45):', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name);

// Step 1: Warp into Nether Portal
if (bot.game.dimension === 'overworld') {
  console.log('Entering Nether Portal block at (299.5, 73.0, -54.0)...');
  const target = new Vec3(299.5, 73.0, -54.0);
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(1500);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 30000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - 299.5) > 0.4 || Math.abs(cur.z - (-54.0)) > 0.4 || cur.y < 72.8) {
      await bot.lookAt(target, true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(300);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(300);
  }

  if (bot.game.dimension === 'the_nether') {
    console.log('Successfully warped to the_nether! Stepping into bunker...');
    await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
    bot.setControlState('forward', true);
    await sleep(1200);
    bot.setControlState('forward', false);
  }
}

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// Step 2: In Nether, execute safe march to Spawner Pillbox
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether with Shield! Marching 19 waypoints to Spawner Pillbox (36, 66, -187)...');
  globalThis.configureFireAvoidance();

  const WAYPOINTS = [
    new Vec3(46, 65, -7),
    new Vec3(54, 65, -7),
    new Vec3(63, 64, -7),
    new Vec3(63, 65, -20),
    new Vec3(63, 66, -35),
    new Vec3(62, 67, -50),
    new Vec3(61, 67, -65),
    new Vec3(62, 67, -80),
    new Vec3(61, 66, -100),
    new Vec3(50, 65, -115),
    new Vec3(44, 65, -127), // Fortress Workshop Bunker
    new Vec3(44, 65, -145), // Covered Tunnel
    new Vec3(44, 65, -160),
    new Vec3(44, 65, -169), // Blast Wall
    new Vec3(38, 65, -176), // Cross Bridge start
    new Vec3(37, 65, -178), // Turn safely west
    new Vec3(37, 66, -182), // Covered approach
    new Vec3(36, 66, -185), // Pillbox entry
    new Vec3(36, 66, -187)  // Spawner Pillbox Firing Slit
  ];

  // March along waypoints
  for (let i = 0; i < WAYPOINTS.length && !isCancelled(); i++) {
    const wp = WAYPOINTS[i];
    if (bot.entity.position.distanceTo(wp) < 1.5) continue;

    // Enable sneak past z=-165 to make edge falls impossible
    if (wp.z <= -165) {
      bot.setControlState('sneak', true);
    } else {
      bot.setControlState('sneak', false);
    }

    // Keep gaze low to avoid Endermen
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 1.0, { dig: false, timeoutMs: 10000 });
    } catch (err) {
      try {
        await bot.lookAt(wp.offset(0.5, 0.5, 0.5), true);
        bot.setControlState('forward', true);
        await sleep(700);
        bot.setControlState('forward', false);
      } catch (e2) {}
    }

    try { await lib.pickup(3.0); } catch (e) {}

    if (bot.health <= 6) {
      console.log(`HP low (${bot.health}) during march at WP ${i + 1}, taking cover.`);
      break;
    }
  }
  bot.setControlState('sneak', false);

  console.log('Arrived at Spawner Pillbox area! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

  // Step 3: Settle into firing stance at (36.0, 66.0, -186.5)
  try {
    await lib.goTo(36.0, 66.0, -186.5, 0.5, { dig: false, timeoutMs: 6000 });
  } catch (e) {
    await bot.lookAt(new Vec3(36.0, 66.0, -186.5));
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  }

  // Step 4: Lock stationary behind battlements
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  bot.chat(`alpha: Locked behind Pillbox firing slit at ${lib.fmt(bot.entity.position)} with Shield! Slaying Blazes for Milestone 8! Rods: ${lib.count('blaze_rod')}/8`);

  const combatStart = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let blazesKilled = 0;
  let piglinsKilled = 0;

  while (!isCancelled() && Date.now() - combatStart < 140000) {
    // Safety health check
    if (bot.health <= 6) {
      console.log(`HP low (${bot.health.toFixed(1)}/20)! Retreating to covered corridor at (44, 65, -169)...`);
      bot.chat(`alpha: HP low (${bot.health.toFixed(1)}/20)! Retreating to corridor cover!`);
      try { await lib.goTo(44, 65, -169, 1.5, { timeoutMs: 5000 }); } catch (e) {}
      break;
    }

    // Defend against any Piglin in close range
    const nearbyPiglins = Object.values(bot.entities)
      .filter(e => e.name === 'piglin' && e.isValid && (e.health === undefined || e.health > 0) && bot.entity.position.distanceTo(e.position) <= 3.8);
    if (nearbyPiglins.length > 0) {
      const pig = nearbyPiglins[0];
      if (Date.now() - lastAttack > 625) {
        await bot.lookAt(pig.position.offset(0, 1.4, 0), true);
        bot.attack(pig);
        lastAttack = Date.now();
        console.log(`Defended against Piglin at ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m!`);
        if (pig.health !== undefined && pig.health <= 0) piglinsKilled++;
      }
      await sleep(100);
      continue;
    }

    // Strike nearest Blaze through slit
    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      if (dist <= 4.8 && Date.now() - lastAttack > 625) {
        await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
        bot.attack(target);
        lastAttack = Date.now();
        console.log(`Hit Blaze at ${dist.toFixed(1)}m (Blaze HP: ${target.health !== undefined ? target.health.toFixed(1) : '?'})`);
        if (target.health !== undefined && target.health <= 0) blazesKilled++;
      }
    }

    // Safe stationary drop pickup (stay east of x=35.5)
    if (bot.entity.position.x >= 35.5 && Math.random() < 0.25) {
      try { await lib.pickup(2.5); } catch (e) {}
    }

    // Blaze Rod harvest check
    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      console.log(`*** BLAZE ROD HARVESTED! Total: ${curRods}/8 ***`);
      bot.chat(`alpha: BLAZE ROD HARVESTED! Total: ${curRods}/8!`);
      lastRods = curRods;
    }

    if (curRods >= 8) {
      bot.chat(`alpha: TARGET ACHIEVED! ${curRods} Blaze Rods! Milestone 8 COMPLETE!`);
      break;
    }

    await sleep(150);
  }

  // Final drop pickup
  if (bot.entity.position.x >= 35.5) {
    try { await lib.pickup(3.0); } catch (e) {}
  }

  const finalRods = lib.count('blaze_rod');
  console.log(`Combat summary: Blazes killed: ${blazesKilled}, Piglins killed: ${piglinsKilled}, Blaze Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);
  bot.chat(`alpha: Combat round complete. Blazes: ${blazesKilled}, Blaze Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);

  if (finalRods >= 8) {
    console.log('Milestone 8 complete! Retreating to Overworld base...');
    await retreatToOverworldBase();
  }
}

console.log('=== Program 646 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Rods:', lib.count('blaze_rod'), 'Inv:', lib.inv());
