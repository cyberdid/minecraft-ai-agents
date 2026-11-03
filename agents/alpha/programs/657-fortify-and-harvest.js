// programs/657-fortify-and-harvest.js
console.log('=== Program 657: Fortify Parapet & Active Blaze Slayer ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Equip shield in offhand and stone sword in main hand
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
console.log('Offhand (slot 45):', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name);

// If in Overworld (e.g. after respawn), warp to Nether
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

  // Step 1: Fortify battlement at (35, 66, -187) if air
  const parapetBlock = bot.blockAt(new Vec3(35, 66, -187));
  if (parapetBlock && parapetBlock.name === 'air' && lib.count('cobblestone') > 0) {
    console.log('Placing solid battlement at (35, 66, -187)...');
    try {
      await lib.place('cobblestone', 35, 66, -187);
      console.log('Battlement placed successfully!');
    } catch (err) {
      console.log('Battlement place note:', err.message);
    }
  }

  // Step 2: Step right up to parapet at (35.9, 66.0, -187.2)
  console.log('Positioning at frontline firing stance (35.9, 66.0, -187.2)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(35.9, 66.0, -187.2, 0.25));
  } catch (e) {
    await bot.lookAt(new Vec3(35.9, 66.0, -187.2));
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
  }

  // Lock stationary
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  bot.chat(`alpha: Locked at fortified battlement (${lib.fmt(bot.entity.position)}) with Shield! Slaying Blazes for Milestone 8! Rods: ${lib.count('blaze_rod')}/8`);

  const farmDurationMs = 240000;
  const startTime = Date.now();
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let hits = 0;
  let kills = 0;

  // Active shield raised by default facing spawner
  bot.activateItem(true);
  await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);

  while (!isCancelled() && Date.now() - startTime < farmDurationMs) {
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
        bot.activateItem(true); // Keep shield raised
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

console.log('=== Program 657 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Rods:', lib.count('blaze_rod'), 'Inv:', lib.inv());
