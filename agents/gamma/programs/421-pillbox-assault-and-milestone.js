// programs/421-pillbox-assault-and-milestone.js
console.log('=== DAWN REINFORCEMENT & BLAZE ROD MILESTONE ASSAULT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Cancel previous background loops
const myAssaultId = Date.now();
globalThis.activeAssaultId = myAssaultId;
bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// 1. Exit base and transit Nether Portal
if (bot.game.dimension === 'overworld') {
  console.log('Exiting base door at (294, 72, -54)...');
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  console.log('Entering Nether Portal...');
  await globalThis.enterNetherPortal();
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Failed to enter the_nether, dim:', bot.game.dimension);
  return { error: 'Not in nether' };
}

bot.chat('gamma: In Nether at dawn! Marching to Spawner Pillbox to claim Milestone 8 with Beta & Delta!');

globalThis.configureFireAvoidance();
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Safe waypoints
const waypoints = [
  new Vec3(46, 65, -7),
  new Vec3(54, 65, -7),
  new Vec3(63, 64, -7),
  new Vec3(63, 65, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -80),
  new Vec3(61.5, 66, -90),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127), // Fortress Workshop Outpost
  new Vec3(44, 65, -145), // Covered Tunnel
  new Vec3(44, 65, -160),
  new Vec3(44, 65, -169), // Blast Wall
  new Vec3(38, 65, -176), // Cross Bridge
  new Vec3(36, 66, -183), // Pillbox Corridor (x=36)
  new Vec3(36.0, 66.0, -186.0) // Firing Station
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  if (globalThis.activeAssaultId !== myAssaultId) return;
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.0) continue;

  // Active Piglin defense
  const piglin = bot.nearestEntity(e => (e.name === 'piglin' || e.name === 'piglin_brute') && e.position.distanceTo(bot.entity.position) <= 4.0);
  if (piglin) {
    console.log(`Defending against Piglin at dist=${bot.entity.position.distanceTo(piglin.position).toFixed(1)}m...`);
    await bot.lookAt(piglin.position.offset(0, 1.2, 0), true);
    bot.attack(piglin);
    await sleep(625);
    bot.attack(piglin);
    await sleep(625);
  }

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: false, timeoutMs: 12000 });
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 1, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
  }

  try { await lib.pickup(3.5); } catch (e) {}

  if (bot.health <= 6) {
    console.log(`HP low (${bot.health}) at WP ${i + 1}, stopping in cover.`);
    break;
  }
}

console.log('Arrived at Spawner Pillbox. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Step firmly into firing slit position
try {
  await lib.goTo(36.0, 66.0, -186.0, 0.8, { dig: false, timeoutMs: 5000 });
} catch (e) {}

bot.clearControlStates();
bot.pathfinder.setGoal(null);

// 2. Knockback Prevention: Place solid back wall if open
if (lib.count('cobblestone') >= 2) {
  try {
    const rear1 = bot.blockAt(new Vec3(36, 66, -185));
    if (rear1 && (rear1.name === 'air' || rear1.name === 'cave_air')) {
      console.log('Placing solid backstop at (36, 66, -185)...');
      await lib.place('cobblestone', 36, 66, -185);
    }
  } catch (e) {}
}

bot.chat('gamma: Locked in fortified Pillbox behind 1-block firing slit! Slaying Blazes!');
console.log('Engaging Blazes through firing slit from stationary position...');

// 3. Combat loop
const farmStart = Date.now();
const targetRods = 8;
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let killed = 0;

while (!isCancelled() && Date.now() - farmStart < 140000) {
  if (globalThis.activeAssaultId !== myAssaultId) break;

  if (bot.health <= 6) {
    // Hold stationary behind wall to recover
    await sleep(1000);
    continue;
  }

  // Look for Blazes within melee reach (4.8m)
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
        console.log(`Blaze eliminated! Total kills: ${killed}`);
      }
    }
  }

  // Vacuum drops stationary (never move forward!)
  if (Math.random() < 0.25) {
    try { await lib.pickup(3.5); } catch (e) {}
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`gamma: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
    lastRods = curRods;
  }
  if (curRods >= targetRods) break;
  await sleep(150);
}

try { await lib.pickup(4.0); } catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log(`Farming round finished. Blaze Rods: ${finalRods}, HP: ${bot.health}, Pos: ${lib.fmt(bot.entity.position)}`);

if (finalRods >= 8) {
  bot.chat(`gamma: MILESTONE 8 COMPLETE! Harvested ${finalRods} Blaze Rods!`);
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: finalRods,
  inv: lib.inv()
};
