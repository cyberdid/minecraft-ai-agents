// programs/641-enter-and-slay.js
console.log('=== Program 641: Enter Portal & Pillbox Blaze Slayer ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Step 1: Step into the portal
if (bot.game.dimension === 'overworld') {
  console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
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
    // Step forward out of nether portal frame into bunker
    await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
    bot.setControlState('forward', true);
    await sleep(1000);
    bot.setControlState('forward', false);
  }
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// Step 2: Safe march to Pillbox
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Fast marching via safe waypoints to Spawner Pillbox (36, 66, -187)...');
  console.log('Executing safeMarchToPillbox()...');
  const marchRes = await safeMarchToPillbox();
  console.log('March result:', marchRes);

  // Step 3: Settle into firing stance
  try {
    await lib.goTo(36.0, 66.0, -186.5, 0.5, { dig: false, timeoutMs: 6000 });
  } catch (e) {
    await bot.lookAt(new Vec3(36.0, 66.0, -186.5));
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  }
  console.log('Locked at stance:', lib.fmt(bot.entity.position));

  // Step 4: Equip weapon and lock stationary
  await lib.equipWeapon();
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  bot.chat(`alpha: Locked behind pillbox wall at ${lib.fmt(bot.entity.position)}! Slaying Blazes for Milestone 8! Rods: ${lib.count('blaze_rod')}/8`);

  const combatStart = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let blazesKilled = 0;
  let piglinsKilled = 0;

  while (!isCancelled() && Date.now() - combatStart < 140000) {
    // Low health retreat
    if (bot.health <= 6) {
      console.log(`HP low (${bot.health.toFixed(1)}/20)! Falling back to covered corridor...`);
      bot.chat(`alpha: HP low (${bot.health.toFixed(1)}/20)! Falling back to covered corridor!`);
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
        console.log(`Attacked Piglin at ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m!`);
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

    // Safe stationary pickup
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
      bot.chat(`alpha: MILESTONE 8 COMPLETE! We have ${curRods} Blaze Rods!`);
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
  bot.chat(`alpha: Combat round complete. Blazes killed: ${blazesKilled}, Blaze Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);

  if (finalRods >= 8) {
    console.log('Milestone 8 complete! Retreating to Overworld base...');
    await retreatToOverworldBase();
  }
}

console.log('=== Program 641 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Rods:', lib.count('blaze_rod'), 'Inv:', lib.inv());
