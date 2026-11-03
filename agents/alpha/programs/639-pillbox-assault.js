// programs/639-pillbox-assault.js
console.log('=== Program 639: Pillbox Assault & Piglin-Proof Defense ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Step 1: In Overworld, enter Nether Portal
if (bot.game.dimension === 'overworld') {
  const door = bot.findBlock({ matching: b => b && b.name.includes('door'), maxDistance: 6 });
  if (door) {
    try { await lib.door(door.position.x, door.position.y, door.position.z, true); } catch (e) {}
  }
  try { await lib.goTo(299, 72, -53, 1, { timeoutMs: 15000 }); } catch (e) {}
  console.log('Entering Nether Portal...');
  await enterNetherPortal();
  console.log('Warp result:', bot.game.dimension, lib.fmt(bot.entity.position));
}

// Step 2: In Nether, march to Pillbox
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Marching 16 waypoints to Spawner Pillbox (36, 66, -187)...');
  await marchToSpawnerPillbox();
  console.log('March complete. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

  // Step 3: Step firmly into firing slit position at (36.0, 66.0, -186.5)
  try {
    await lib.goTo(36.0, 66.0, -186.5, 0.5, { dig: false, timeoutMs: 6000 });
  } catch (e) {
    await bot.lookAt(new Vec3(36.0, 66.0, -186.5));
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  }
  console.log('In position at:', lib.fmt(bot.entity.position));

  // Step 4: Piglin-Proof the rear entrance at (37, 66, -183)
  if (lib.count('cobblestone') >= 2) {
    try {
      const bRear1 = bot.blockAt(new Vec3(37, 66, -183));
      if (bRear1 && bRear1.name === 'air') {
        console.log('Placing rear barrier block 1 at (37, 66, -183)...');
        await lib.place('cobblestone', 37, 66, -183);
      }
      const bRear2 = bot.blockAt(new Vec3(37, 67, -183));
      if (bRear2 && bRear2.name === 'air') {
        console.log('Placing rear barrier block 2 at (37, 67, -183)...');
        await lib.place('cobblestone', 37, 67, -183);
      }
    } catch (err) {
      console.log('Rear barrier note:', err.message);
    }
  }

  // Step 5: Enhanced combat loop (Blazes + Piglins + Drops)
  await lib.equipWeapon();
  bot.chat(`alpha: Locked at Pillbox firing slit! Slaying Blazes for Milestone 8! Rods: ${lib.count('blaze_rod')}/8`);

  const combatStart = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let blazesKilled = 0;
  let piglinsKilled = 0;

  while (!isCancelled() && Date.now() - combatStart < 120000) {
    // Health safety retreat
    if (bot.health <= 6) {
      console.log(`HP low (${bot.health.toFixed(1)}/20)! Retreating along covered corridor!`);
      bot.chat(`alpha: HP low (${bot.health.toFixed(1)}/20)! Retreating to corridor cover!`);
      try { await lib.goTo(44, 65, -169, 1.5, { timeoutMs: 5000 }); } catch (e) {}
      break;
    }

    // Prioritize hostile Piglins right next to us
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

    // Target nearest Blaze
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

    // Safe stationary pickup (never step west of x=35.5)
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

  // Final pickup
  if (bot.entity.position.x >= 35.5) {
    try { await lib.pickup(3.0); } catch (e) {}
  }

  const finalRods = lib.count('blaze_rod');
  console.log(`Combat summary: Blazes killed: ${blazesKilled}, Piglins: ${piglinsKilled}, Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);
  bot.chat(`alpha: Combat round complete. Blazes killed: ${blazesKilled}, Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);

  if (finalRods >= 8) {
    console.log('Milestone 8 complete! Retreating to Overworld base...');
    await retreatToOverworldBase();
  }
}

console.log('=== Program 639 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Rods:', lib.count('blaze_rod'), 'Inv:', lib.inv());
