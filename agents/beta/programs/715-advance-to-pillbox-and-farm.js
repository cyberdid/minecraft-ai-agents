// programs/715-advance-to-pillbox-and-farm.js
console.log('=== Program 715: Advance to Pillbox & Slay Blazes ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);
console.log('Blaze Rods currently held:', lib.count('blaze_rod'));

bot.clearControlStates();
bot.pathfinder.stop();

if (bot.game.dimension !== 'the_nether') {
  console.log('Not in Nether, entering Nether Portal...');
  await enterNetherPortal();
}

configureFireAvoidance();
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

// March waypoints 8 through 16
const waypoints = NETHER_PILLBOX_WAYPOINTS;
console.log('Advancing along remaining waypoints to Spawner Pillbox...');

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  // Skip waypoints we are already past
  if (bot.entity.position.z < wp.z + 5 && bot.entity.position.distanceTo(target) > 5) continue;
  if (bot.entity.position.distanceTo(target) < 3.0) continue;

  console.log(`WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z}), dist: ${bot.entity.position.distanceTo(target).toFixed(1)}m...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: false, timeoutMs: 10000 });
  } catch (err) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 }); } catch (e2) {}
  }
  try { await lib.pickup(3.5); } catch (e) {}
}

console.log('Waypoint march phase complete. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Move directly inside Pillbox behind breastwork at (36.0, 66.0, -186.5)
if (bot.game.dimension === 'the_nether' && bot.entity.position.distanceTo(new Vec3(36, 66, -187)) < 15) {
  try {
    await lib.goTo(36.0, 66.0, -186.5, 0.8, { dig: false, timeoutMs: 6000 });
  } catch (e) {}

  if (sword) await bot.equip(sword, 'hand');
  console.log('Beta in Pillbox! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
  bot.chat(`Beta: In Spawner Pillbox! Slaying Blazes for Milestone 8 (Blaze Rods)!`);

  // Combat Loop
  const farmStart = Date.now();
  const targetRods = 8;
  let lastRods = lib.count('blaze_rod');
  let lastAttack = 0;
  let killed = 0;

  while (!isCancelled() && Date.now() - farmStart < 120000 && bot.game.dimension === 'the_nether') {
    const blazes = Object.values(bot.entities)
      .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
      .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    const target = blazes[0];
    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      if (dist <= 4.8 && Date.now() - lastAttack > 625) {
        await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.5, 0), true);
        bot.attack(target);
        lastAttack = Date.now();
        if (target.health !== undefined && target.health <= 0) {
          killed++;
          console.log(`Blaze slain! Kills: ${killed}`);
        }
      }
    }

    if (Math.random() < 0.25) {
      try { await lib.pickup(3.5); } catch (e) {}
    }

    const curRods = lib.count('blaze_rod');
    if (curRods > lastRods) {
      bot.chat(`Beta: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
      lastRods = curRods;
    }

    if (curRods >= targetRods) {
      bot.chat(`Beta: Milestone 8 COMPLETED! ${curRods} Blaze Rods secured!`);
      break;
    }

    await sleep(150);
  }

  try { await lib.pickup(4.0); } catch (e) {}

  const finalRods = lib.count('blaze_rod');
  console.log('Combat cycle complete.');
  console.log('Blaze Rods in inventory:', finalRods, 'Kills:', killed, 'HP:', bot.health);

  if (finalRods >= targetRods) {
    bot.chat(`Beta: Milestone 8 Complete! Retreating to Base with ${finalRods} Blaze Rods!`);
    await retreatToOverworldBase();
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  hp: bot.health
};
