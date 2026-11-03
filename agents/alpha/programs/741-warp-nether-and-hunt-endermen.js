// programs/741-warp-nether-and-hunt-endermen.js
console.log('=== Program 741: Warp to Nether & Hunt Endermen in Soul Sand Valley ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield and iron sword
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

try {
  const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (sw) await bot.equip(sw, 'hand');
  else await lib.equipWeapon();
} catch (e) {}

// 2. Step into portal center (299.5, 73.0, -53.5) and stand motionless
if (bot.game.dimension === 'overworld') {
  bot.clearControlStates();
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);

  console.log('Stepping into portal center (299.5, 73.0, -53.5)...');
  await bot.lookAt(new Vec3(299.5, 73.5, -53.5), true);
  bot.setControlState('forward', true);
  await sleep(500);
  bot.setControlState('forward', false);

  // Stand completely motionless for survival portal warp (80 ticks = 4s)
  console.log('Standing completely motionless inside nether_portal block...');
  bot.chat('alpha: Inside portal frame; standing motionless for survival warp into the_nether...');
  
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !checkCancelled()) {
    await sleep(250);
  }
}

if (bot.game.dimension !== 'the_nether') {
  // If still in overworld, try 1 more gentle step forward
  if (bot.game.dimension === 'overworld') {
    await bot.lookAt(new Vec3(299.5, 73.0, -53.5), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
    const retryStart = Date.now();
    while (bot.game.dimension !== 'the_nether' && Date.now() - retryStart < 15000 && !checkCancelled()) {
      await sleep(250);
    }
  }
}

if (bot.game.dimension === 'the_nether') {
  console.log('Successfully warped into the_nether at:', lib.fmt(bot.entity.position));
  bot.chat(`alpha: In the_nether at ${lib.fmt(bot.entity.position)}! Stepping out of portal into bunker...`);

  // Step out of portal into bunker
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.setControlState('forward', false);

  globalThis.configureFireAvoidance();

  // 3. March safe Soul Sand Valley waypoints (WP 0 to WP 14) and hunt Endermen
  let pearlsHarvested = 0;
  let initialPearls = lib.count('ender_pearl');

  for (let i = 0; i < 15 && !checkCancelled(); i++) {
    const wp = globalThis.NETHER_PILLBOX_WAYPOINTS[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 2.0) continue;

    await globalThis.clearFireAhead();

    // Hoglin zone protection (z=-70..-105)
    if (wp.z <= -70 && wp.z >= -105) {
      bot.activateItem(true);
      bot.setControlState('sneak', true);
    } else {
      bot.deactivateItem();
      bot.setControlState('sneak', false);
    }

    // Scan for Endermen within 30m of covered trail
    const endermen = Object.values(bot.entities).filter(e =>
      e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 30
    );

    if (endermen.length > 0) {
      const em = endermen[0];
      const dist = bot.entity.position.distanceTo(em.position).toFixed(1);
      console.log(`Enderman spotted at ${lib.fmt(em.position)} (${dist}m)! Provoking gaze from covered trail...`);
      bot.chat(`alpha: Provoking Enderman at ${lib.fmt(em.position)} from covered trail!`);

      // Stare at head (y + 2.7) to provoke
      await bot.lookAt(em.position.offset(0, 2.7, 0), true);
      await sleep(800);

      // Combat loop while Enderman attacks
      const emStart = Date.now();
      let emHit = 0;
      while (!checkCancelled() && em.isValid && Date.now() - emStart < 15000) {
        const d = bot.entity.position.distanceTo(em.position);
        await bot.lookAt(em.position.offset(0, 1.2, 0), true);

        if (d <= 3.8 && Date.now() - emHit > 625) {
          bot.deactivateItem();
          try { await lib.equipWeapon(); } catch (e) {}
          bot.attack(em);
          emHit = Date.now();
          bot.activateItem(true);
          console.log(`Hit Enderman! Distance: ${d.toFixed(1)}m`);
        } else {
          bot.activateItem(true);
        }
        await sleep(80);
      }
      bot.deactivateItem();
      await lib.pickup(5.0);

      const curPearls = lib.count('ender_pearl');
      if (curPearls > initialPearls) {
        pearlsHarvested += (curPearls - initialPearls);
        initialPearls = curPearls;
        console.log(`*** HARVESTED ENDER PEARL! Total: ${curPearls}/12 ***`);
        bot.chat(`alpha: Harvested Ender Pearl! Total: ${curPearls}/12 toward Milestone 9!`);
      }
    }

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try {
        await globalThis.clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
      } catch (e2) {}
    }

    await lib.pickup(3.0);
  }

  bot.clearControlStates();
  bot.deactivateItem();

  const finalPearls = lib.count('ender_pearl');
  console.log(`Operations complete at ${lib.fmt(bot.entity.position)}. Total pearls: ${finalPearls}/12, HP: ${bot.health}`);
  bot.chat(`alpha: Hunt & march completed at Fortress Bunker ${lib.fmt(bot.entity.position)}! Pearls: ${finalPearls}/12, HP: ${bot.health.toFixed(1)}/20`);
}

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
