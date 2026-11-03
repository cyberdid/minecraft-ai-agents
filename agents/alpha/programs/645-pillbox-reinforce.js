// programs/645-pillbox-reinforce.js
console.log('=== Program 645: Pillbox Reinforce & Blaze Rod Slayer ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Ensure shield is in offhand and weapon equipped
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
console.log('Offhand (slot 45):', bot.inventory.slots[45]?.name, 'Held weapon:', bot.heldItem?.name);

// If in Overworld (e.g. after respawn with full 20 HP), warp to Nether
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld. Heading to Nether Portal...');
  try {
    await lib.goTo(299, 72, -53, 1, { timeoutMs: 15000 });
  } catch (e) {}
  console.log('Warping into Nether Portal...');
  await enterNetherPortal();
}

// In the Nether
if (bot.game.dimension === 'the_nether') {
  globalThis.configureFireAvoidance();
  console.log('In Nether at', lib.fmt(bot.entity.position), 'HP:', bot.health);

  // Safe waypoints to Pillbox
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
    new Vec3(44, 65, -127),
    new Vec3(44, 65, -145),
    new Vec3(44, 65, -160),
    new Vec3(44, 65, -169),
    new Vec3(38, 65, -176),
    new Vec3(37, 65, -178),
    new Vec3(37, 66, -182),
    new Vec3(36, 66, -185),
    new Vec3(36, 66, -187)
  ];

  // Find the closest waypoint ahead of us
  let startIdx = 0;
  let minDist = 999;
  for (let i = 0; i < WAYPOINTS.length; i++) {
    const d = bot.entity.position.distanceTo(WAYPOINTS[i]);
    if (d < minDist) {
      minDist = d;
      startIdx = i;
    }
  }
  console.log(`Starting march from nearest WP ${startIdx + 1}/${WAYPOINTS.length}: ${lib.fmt(WAYPOINTS[startIdx])} (dist: ${minDist.toFixed(1)}m)`);

  for (let i = startIdx; i < WAYPOINTS.length && !isCancelled(); i++) {
    const wp = WAYPOINTS[i];
    if (bot.entity.position.distanceTo(wp) < 1.5) continue;

    if (wp.z <= -165) {
      bot.setControlState('sneak', true);
    } else {
      bot.setControlState('sneak', false);
    }

    // Keep gaze low
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 1.0, { dig: false, timeoutMs: 8000 });
    } catch (err) {
      try {
        await bot.lookAt(wp.offset(0.5, 0.5, 0.5), true);
        bot.setControlState('forward', true);
        await sleep(600);
        bot.setControlState('forward', false);
      } catch (e2) {}
    }

    try { await lib.pickup(3.0); } catch (e) {}

    // Check if died and respawned
    if (bot.game.dimension === 'overworld') {
      console.log('Respawned in Overworld during march. Re-entering Nether...');
      try { await lib.equipArmor(); } catch (e) {}
      try { await lib.equipWeapon(); } catch (e) {}
      await enterNetherPortal();
      i = -1; // restart march from portal
      continue;
    }
  }
  bot.setControlState('sneak', false);

  console.log('Arrived at Spawner Pillbox! Pos:', lib.fmt(bot.entity.position));

  // Step firmly into firing stance at (36.0, 66.0, -186.5)
  try {
    await lib.goTo(36.0, 66.0, -186.5, 0.5, { dig: false, timeoutMs: 5000 });
  } catch (e) {
    await bot.lookAt(new Vec3(36.0, 66.0, -186.5));
    bot.setControlState('forward', true);
    await sleep(500);
    bot.setControlState('forward', false);
  }

  // Lock stationary
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  bot.chat(`alpha: Locked behind Pillbox firing slit at ${lib.fmt(bot.entity.position)} with Shield & Sword! Slaying Blazes for Milestone 8! Rods: ${lib.count('blaze_rod')}/8`);

  const combatStart = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let blazesKilled = 0;
  let piglinsKilled = 0;

  while (!isCancelled() && Date.now() - combatStart < 140000) {
    // If died and respawned, exit combat loop
    if (bot.game.dimension === 'overworld') {
      console.log('Respawned in Overworld.');
      break;
    }

    // Health safety check
    if (bot.health <= 5) {
      console.log(`HP low (${bot.health.toFixed(1)}/20)! Falling back to corridor cover at (44, 65, -169)...`);
      try { await lib.goTo(44, 65, -169, 1.5, { timeoutMs: 5000 }); } catch (e) {}
      break;
    }

    // Defend against any Piglin within 3.8m
    const nearbyPiglins = Object.values(bot.entities)
      .filter(e => e.name === 'piglin' && e.isValid && (e.health === undefined || e.health > 0) && bot.entity.position.distanceTo(e.position) <= 3.8);
    if (nearbyPiglins.length > 0) {
      const pig = nearbyPiglins[0];
      if (Date.now() - lastAttack > 625) {
        await bot.lookAt(pig.position.offset(0, 1.4, 0), true);
        bot.attack(pig);
        lastAttack = Date.now();
        console.log(`Attacked Piglin at ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m!`);
        if (pig.health !== undefined && pig.health <= 0) piglinsKilled++;
      }
      await sleep(100);
      continue;
    }

    // Attack nearest Blaze through slit
    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      if (dist <= 4.8 && Date.now() - lastAttack > 625) {
        // Look at target, strike
        await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
        bot.attack(target);
        lastAttack = Date.now();
        console.log(`Hit Blaze at ${dist.toFixed(1)}m (Blaze HP: ${target.health !== undefined ? target.health.toFixed(1) : '?'})`);
        if (target.health !== undefined && target.health <= 0) blazesKilled++;
      }
    }

    // Safe pickup within reach (never step west of x=35.5)
    if (bot.entity.position.x >= 35.5 && Math.random() < 0.25) {
      try { await lib.pickup(2.5); } catch (e) {}
    }

    // Check blaze rods
    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      console.log(`*** BLAZE ROD HARVESTED! Total: ${curRods}/8 ***`);
      bot.chat(`alpha: BLAZE ROD HARVESTED! Total: ${curRods}/8!`);
      lastRods = curRods;
    }

    if (curRods >= 8) {
      bot.chat(`alpha: MILESTONE 8 COMPLETE! We have ${curRods} Blaze Rods!`);
      break;
    }

    await sleep(150);
  }

  // Final pickup
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

console.log('=== Program 645 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Rods:', lib.count('blaze_rod'), 'Inv:', lib.inv());
