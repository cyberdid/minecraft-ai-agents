// programs/656-blaze-slayer-victory.js
console.log('=== Program 656: Direct Pillbox Blaze Slayer & Rod Victory ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Ensure shield in offhand and weapon in hand
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
console.log('Offhand (slot 45):', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name);

// If by any chance in Overworld, warp to Nether
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld. Entering Nether Portal (299.5, 73, -54)...');
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
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(400);
  }
}

// In the Nether
if (bot.game.dimension === 'the_nether') {
  // If not yet at the pillbox, march there
  if (bot.entity.position.distanceTo(new Vec3(36.5, 66.0, -187.5)) > 6.0) {
    console.log('Marching to Pillbox...');
    await safeMarchToPillbox();
  }

  // Lock strictly into position at (36.5, 66.0, -187.5)
  console.log('Locking into Pillbox firing stance at (36.5, 66.0, -187.5)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -187.5, 0.3));
  } catch (e) {}

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  bot.chat(`alpha: Locked at Pillbox firing slit at ${lib.fmt(bot.entity.position)} with Shield! Slaying Blazes for Milestone 8! Rods: ${lib.count('blaze_rod')}/8`);

  const farmDurationMs = 240000;
  const startTime = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let hits = 0;
  let kills = 0;

  // Active shield raised by default
  bot.activateItem(true);
  await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);

  while (!isCancelled() && Date.now() - startTime < farmDurationMs) {
    // If died and respawned, exit
    if (bot.game.dimension === 'overworld') break;

    // Check all active Blazes sorted by distance
    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      // Face target to block fireballs with shield
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

      // Strike if within melee reach (<= 4.8m)
      if (dist <= 4.8 && Date.now() - lastAttack > 625) {
        bot.deactivateItem(); // Lower shield for attack
        try { await lib.equipWeapon(); } catch (e) {}
        bot.attack(target);   // Strike!
        lastAttack = Date.now();
        hits++;
        console.log(`Struck Blaze at ${dist.toFixed(1)}m (Blaze HP: ${target.health !== undefined ? target.health.toFixed(1) : '?'}) [Hit #${hits}]`);
        if (target.health !== undefined && target.health <= 0) {
          kills++;
          console.log(`+++ BLAZE ELIMINATED! Total kills: ${kills} +++`);
        }
        bot.activateItem(true); // Raise shield immediately
      } else {
        bot.activateItem(true); // Keep shield up
      }
    } else {
      // Face spawner (32, 68, -190) with shield raised
      await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
      bot.activateItem(true);
    }

    // Passive pickup within 2.5m (staying stationary behind wall)
    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      console.log(`*** BLAZE ROD HARVESTED! Total: ${curRods}/8 ***`);
      bot.chat(`alpha: BLAZE ROD HARVESTED! Total: ${curRods}/8!`);
      lastRods = curRods;
    }

    if (curRods >= 8) {
      console.log('Milestone 8 target reached: 8+ Blaze Rods!');
      bot.chat(`alpha: MILESTONE 8 COMPLETE! We have ${curRods} Blaze Rods!`);
      break;
    }

    await sleep(80);
  }

  bot.deactivateItem();

  const totalRods = lib.count('blaze_rod');
  console.log(`Combat cycle end. Total hits: ${hits}, Kills: ${kills}, Rods: ${totalRods}/8, HP: ${bot.health}`);
  bot.chat(`alpha: Combat round complete. Hits: ${hits}, Kills: ${kills}, Rods: ${totalRods}/8, HP: ${bot.health.toFixed(1)}`);

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

console.log('=== Program 656 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Rods:', lib.count('blaze_rod'), 'Inv:', lib.inv());
