// programs/644-shielded-nether-assault.js
console.log('=== Program 644: Shielded Nether Assault & Blaze Rod Harvest ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());
console.log('Offhand (slot 45):', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name);

// Step 1: Handle nearby skeleton if aggressive
const hostiles = Object.values(bot.entities).filter(e => e.name === 'skeleton' && e.isValid && bot.entity.position.distanceTo(e.position) < 8);
if (hostiles.length > 0) {
  const skel = hostiles[0];
  console.log('Nearby skeleton at', lib.fmt(skel.position), 'distance:', bot.entity.position.distanceTo(skel.position).toFixed(1));
  await lib.equipWeapon();
  await bot.lookAt(skel.position.offset(0, 1.4, 0), true);
  bot.attack(skel);
  await sleep(600);
}

// Step 2: Head directly to Nether Portal
if (bot.game.dimension === 'overworld') {
  console.log('Sprinting to Nether Portal approach (299, 72, -53)...');
  try {
    await lib.goTo(299, 72, -53, 1, { timeoutMs: 15000 });
  } catch (e) {
    console.log('goTo portal note:', e.message);
  }

  console.log('Entering Nether Portal...');
  const target = new Vec3(299.5, 73.0, -54.0);
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(1500);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - 299.5) > 0.4 || Math.abs(cur.z - (-54.0)) > 0.4 || cur.y < 72.8) {
      await bot.lookAt(target, true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(250);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }

  if (bot.game.dimension === 'the_nether') {
    await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
    bot.setControlState('forward', true);
    await sleep(1000);
    bot.setControlState('forward', false);
  }
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// Step 3: In Nether, advance to Spawner Pillbox
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether with Shield & Stone Sword! Marching to Spawner Pillbox (36, 66, -187)...');
  globalThis.configureFireAvoidance();

  const SAFE_WAYPOINTS = [
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

  for (let i = 0; i < SAFE_WAYPOINTS.length && !isCancelled(); i++) {
    const wp = SAFE_WAYPOINTS[i];
    if (bot.entity.position.distanceTo(wp) < 1.5) continue;

    // Sneak on exposed bridge past z=-170
    if (wp.z <= -170) {
      bot.setControlState('sneak', true);
    } else {
      bot.setControlState('sneak', false);
    }

    // Gaze low
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

  // Step 4: Step into firing stance at (36.0, 66.0, -186.5)
  try {
    await lib.goTo(36.0, 66.0, -186.5, 0.5, { dig: false, timeoutMs: 6000 });
  } catch (e) {
    await bot.lookAt(new Vec3(36.0, 66.0, -186.5));
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  }

  // Step 5: Equip weapon, verify shield in offhand, lock stationary
  await lib.equipWeapon();
  try { await lib.equipArmor(); } catch (e) {}
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
    // Low health retreat
    if (bot.health <= 6) {
      console.log(`HP low (${bot.health.toFixed(1)}/20)! Retreating along covered corridor...`);
      bot.chat(`alpha: HP low (${bot.health.toFixed(1)}/20)! Retreating to corridor cover!`);
      try { await lib.goTo(44, 65, -169, 1.5, { timeoutMs: 5000 }); } catch (e) {}
      break;
    }

    // Defend against any Piglin within melee reach
    const hostilePiglins = Object.values(bot.entities)
      .filter(e => e.name === 'piglin' && e.isValid && (e.health === undefined || e.health > 0) && bot.entity.position.distanceTo(e.position) <= 3.8);
    if (hostilePiglins.length > 0) {
      const pig = hostilePiglins[0];
      if (Date.now() - lastAttack > 625) {
        await bot.lookAt(pig.position.offset(0, 1.4, 0), true);
        bot.attack(pig);
        lastAttack = Date.now();
        console.log(`Defending against Piglin at ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m!`);
        if (pig.health !== undefined && pig.health <= 0) piglinsKilled++;
      }
      await sleep(100);
      continue;
    }

    // Strike Blazes through slit
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

    // Rods check
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
  console.log(`Combat summary: Blazes killed: ${blazesKilled}, Piglins: ${piglinsKilled}, Blaze Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);
  bot.chat(`alpha: Combat round complete. Blazes: ${blazesKilled}, Blaze Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);

  if (finalRods >= 8) {
    console.log('Milestone 8 complete! Retreating to Overworld base...');
    await retreatToOverworldBase();
  }
}

console.log('=== Program 644 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Rods:', lib.count('blaze_rod'), 'Inv:', lib.inv());
