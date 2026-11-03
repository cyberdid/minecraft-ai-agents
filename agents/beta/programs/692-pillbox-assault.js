// programs/692-pillbox-assault.js
console.log('=== Program 692: Nether Spawner Pillbox Assault ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// 1. Enter Nether Portal
if (bot.game.dimension === 'overworld') {
  console.log('Stepping into Nether Portal at (299.5, 73.0, -54.0)...');
  const portalTarget = new Vec3(299.5, 73.0, -54.0);
  try {
    await lib.goTo(299.5, 73.0, -54.0, 0.8, { timeoutMs: 8000 });
  } catch (e) {}

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
  console.log('Portal step done. Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether (current: ${bot.game.dimension})`);
}

// Step away from Nether portal into base camp
await sleep(400);
await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

// 2. March along the 16 safe waypoints to Spawner Pillbox
configureFireAvoidance();
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

bot.chat('Beta: In the Nether! Marching to Spawner Pillbox (36, 66, -187)...');
console.log('Marching safe waypoints...');

const waypoints = NETHER_PILLBOX_WAYPOINTS;
for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 3.0) continue;

  console.log(`WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: false, timeoutMs: 10000 });
  } catch (err) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 }); } catch (err2) {}
  }
  try { await lib.pickup(3.5); } catch (e) {}

  if (bot.health <= 7) {
    console.log(`Health low (${bot.health}) at WP ${i + 1}, holding cover.`);
    break;
  }
}

console.log('Arrived near pillbox. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 3. Move into the Pillbox at (37, 66, -186)
try {
  await lib.goTo(37.0, 66.0, -186.0, 1.0, { dig: false, timeoutMs: 6000 });
} catch (e) {
  console.log('Pillbox entrance note:', e.message);
}

console.log('Beta positioned at:', lib.fmt(bot.entity.position));
bot.chat('Beta: Inside Spawner Pillbox! Slaying Blazes for Blaze Rods.');

// 4. Farm Blazes
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
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      if (target.health !== undefined && target.health <= 0) {
        killed++;
        console.log(`Blaze slain! Total killed: ${killed}`);
      }
    }
  }

  if (bot.entity.position.x >= 35.5 && Math.random() < 0.25) {
    try { await lib.pickup(2.5); } catch (e) {}
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`Beta: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
    lastRods = curRods;
  }

  if (curRods >= targetRods) {
    bot.chat(`Beta: 8 Blaze Rods obtained! Milestone 8 achieved!`);
    console.log('Milestone 8 complete!');
    break;
  }

  await sleep(150);
}

try { if (bot.entity.position.x >= 35.5) await lib.pickup(3.0); } catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log('Expedition finished. Blaze Rods:', finalRods, 'Kills:', killed, 'HP:', bot.health);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: finalRods,
  killed,
  hp: bot.health
};
