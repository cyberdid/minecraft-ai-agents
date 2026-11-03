// programs/704-team-spawner-triumph.js
console.log('=== Program 704: Team Spawner Triumph ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);
console.log('Starting Blaze Rods:', lib.count('blaze_rod'));

bot.clearControlStates();
bot.pathfinder.stop();

// 1. Enter Nether Portal from base (only ~5 blocks away)
console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299.5, 73.0, -54.0, 0.8, { timeoutMs: 8000 });
} catch (e) {}

const portalTarget = new Vec3(299.5, 73.0, -54.0);
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
  const cur = bot.entity.position;
  if (cur.distanceTo(portalTarget) > 0.8) {
    await bot.lookAt(portalTarget, true);
    bot.setControlState('forward', true);
    if (cur.y < 72.8) bot.setControlState('jump', true);
    await sleep(250);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  await sleep(350);
}
bot.clearControlStates();

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether (current: ${bot.game.dimension})`);
}

// Step away from Nether portal into base camp
await sleep(400);
await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

// 2. March strictly through all 16 waypoints
configureFireAvoidance();
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

bot.chat(`Beta: In Nether! Marching along safe covered waypoints to join Delta & Gamma at Pillbox!`);

const waypoints = NETHER_PILLBOX_WAYPOINTS;
for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 3.0) continue;

  console.log(`WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z}), dist: ${bot.entity.position.distanceTo(target).toFixed(1)}m...`);
  let ok = false;
  for (let att = 1; att <= 2 && !ok && !isCancelled(); att++) {
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: false, timeoutMs: 10000 });
      ok = true;
    } catch (err) {
      console.log(`WP ${i + 1} retry ${att}:`, err.message);
      try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 }); ok = true; } catch (e2) {}
    }
  }
  try { await lib.pickup(3.5); } catch (e) {}

  if (bot.health <= 6) {
    console.log(`Health low (${bot.health}) at WP ${i + 1}, pausing 3s to let fire/hazard clear.`);
    await sleep(3000);
  }
}

console.log('Waypoint march complete! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 3. Enter Pillbox at (36.0, 66.0, -186.5)
try {
  await lib.goTo(36.0, 66.0, -186.5, 0.8, { dig: false, timeoutMs: 6000 });
} catch (e) {}

if (sword) await bot.equip(sword, 'hand');
console.log('In Pillbox! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat(`Beta: United with team in Spawner Pillbox! Slaying Blazes for Milestone 8 (Blaze Rods)!`);

// 4. Intensive Combat Loop
const farmStart = Date.now();
const targetRods = 8;
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let killed = 0;

while (!isCancelled() && Date.now() - farmStart < 120000) {
  if (bot.health <= 6) {
    await sleep(1000);
    continue;
  }

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
    console.log(`Target reached: ${curRods} Blaze Rods!`);
    break;
  }

  await sleep(150);
}

try { await lib.pickup(4.0); } catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log('Combat cycle complete.');
console.log('Blaze Rods in inventory:', finalRods, 'Kills:', killed, 'HP:', bot.health);

if (finalRods >= targetRods) {
  bot.chat(`Beta: Milestone 8 Complete! Retreating to Overworld Base with ${finalRods} Blaze Rods!`);
  await retreatToOverworldBase();
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: finalRods,
  killed,
  hp: bot.health
};
