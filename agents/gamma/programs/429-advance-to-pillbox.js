// programs/429-advance-to-pillbox.js
console.log('=== ADVANCE WITH RAISED SHIELD TO PILLBOX ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Ensure weapon and shield
try {
  const sword = bot.inventory.items().find(i => i.name.includes('sword'));
  if (sword) await bot.equip(sword, 'hand');
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

// Raise shield immediately
console.log('Shield raised in offhand!');
bot.activateItem(true);

// 2. Check for skeleton within 18m
const skel = bot.nearestEntity(e => e.name === 'skeleton' && e.position.distanceTo(bot.entity.position) <= 18);
if (skel) {
  console.log(`Skeleton target at ${lib.fmt(skel.position)}, dist=${bot.entity.position.distanceTo(skel.position).toFixed(1)}m`);
  await bot.lookAt(skel.position.offset(0, 1.4, 0), true);

  // Approach skeleton with shield up
  while (bot.entity.position.distanceTo(skel.position) > 3.2 && skel.isValid && !isCancelled()) {
    await bot.lookAt(skel.position.offset(0, 1.4, 0), true);
    bot.setControlState('forward', true);
    await sleep(200);
  }
  bot.setControlState('forward', false);

  // Strike skeleton
  if (skel.isValid && bot.entity.position.distanceTo(skel.position) <= 4.0) {
    bot.deactivateItem(); // lower shield to strike
    await bot.lookAt(skel.position.offset(0, 1.4, 0), true);
    bot.attack(skel);
    await sleep(625);
    if (skel.isValid) {
      bot.attack(skel);
      await sleep(625);
    }
    console.log('Skeleton struck! HP:', bot.health);
  }
}

// Re-raise shield
bot.activateItem(true);

// 3. March remaining waypoints to Pillbox
const REMAINING_WAYPOINTS = [
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127), // Fortress Workshop Bunker
  new Vec3(44, 65, -145), // Covered Tunnel
  new Vec3(44, 65, -160),
  new Vec3(44, 65, -169), // Blast Wall
  new Vec3(38, 65, -176), // Cross Bridge
  new Vec3(36.5, 66, -186) // Spawner Pillbox
];

for (let i = 0; i < REMAINING_WAYPOINTS.length && !isCancelled(); i++) {
  const wp = REMAINING_WAYPOINTS[i];
  if (bot.entity.position.distanceTo(wp) < 2.5) continue;
  console.log(`Advancing to ${lib.fmt(wp)}...`);

  let timer = null;
  try {
    await Promise.race([
      bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8)),
      new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), 10000); })
    ]);
  } catch (e) {
    await bot.lookAt(wp.offset(0.5, 1, 0.5), true);
    bot.setControlState('forward', true);
    if (wp.y > bot.entity.position.y) bot.setControlState('jump', true);
    await sleep(1500);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  } finally {
    if (timer) clearTimeout(timer);
  }

  try { await lib.pickup(3.5); } catch (e) {}

  if (bot.health <= 1.0) {
    console.log('Health critical (1.0), stopping in cover.');
    break;
  }
}

console.log('Advance completed. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 4. If at Pillbox, engage Blazes
const distToPillbox = bot.entity.position.distanceTo(new Vec3(36.5, 66, -186));
if (distToPillbox <= 6.0) {
  bot.chat('gamma: Inside Spawner Pillbox with Shield! Slaying Blazes shoulder-to-shoulder with team!');
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();

  const farmStart = Date.now();
  const targetRods = 8;
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;

  while (!isCancelled() && Date.now() - farmStart < 120000) {
    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      if (dist <= 4.8 && Date.now() - lastAttack > 625) {
        bot.deactivateItem();
        await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
        bot.attack(target);
        lastAttack = Date.now();
        await sleep(100);
        bot.activateItem(true); // raise shield again
      }
    }

    if (Math.random() < 0.25) {
      try { await lib.pickup(3.8); } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`gamma: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
      lastRods = curRods;
    }
    if (curRods >= targetRods) break;
    await sleep(120);
  }
}

try { await lib.pickup(4.0); } catch (e) {}
console.log('Final status:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Rods:', lib.count('blaze_rod'));

return { pos: bot.entity.position, hp: bot.health, rods: lib.count('blaze_rod'), dim: bot.game.dimension };
