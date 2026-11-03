// programs/420-flawless-pillbox-join.js
console.log('=== FLAWLESS PILLBOX REINFORCEMENT & HARVEST (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Cancel any rogue background loops
const myAssaultId = Date.now();
globalThis.activeAssaultId = myAssaultId;
bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// 1. Enter Nether portal
if (bot.game.dimension === 'overworld') {
  console.log('Exiting base and entering portal...');
  if (bot.entity.position.x < 297 && bot.entity.position.z < -53.5) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }
  await globalThis.enterNetherPortal();
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Failed to enter Nether, dim:', bot.game.dimension);
  return { error: 'Not in nether' };
}

bot.chat('gamma: In Nether! Fast marching via x=36 corridor to reinforce Spawner Pillbox!');

globalThis.configureFireAvoidance();
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Safe waypoints routing through x=36 at the pillbox approach
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
  new Vec3(36, 66, -183), // Pillbox Walkway (x=36 avoids rear block)
  new Vec3(36.5, 66, -186.5) // Firing Station
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  if (globalThis.activeAssaultId !== myAssaultId) return;
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.0) continue;

  // Slay any hostile Piglins blocking the walkway
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
    console.log(`HP low (${bot.health}) at WP ${i + 1}, taking stationary cover.`);
    break;
  }
}

console.log('Arrived near Spawner Pillbox. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Step into firing station
const pillboxPos = new Vec3(36.5, 66.0, -186.5);
try {
  await lib.goTo(pillboxPos.x, pillboxPos.y, pillboxPos.z, 1.0, { dig: false, timeoutMs: 5000 });
} catch (e) {}

// Slay Blazes & collect Blaze Rods
bot.chat('gamma: Firmly in Pillbox firing station! Slaying Blazes alongside team!');
console.log('Engaging Blazes through firing slit...');

const farmStart = Date.now();
const targetRods = 8;
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let killed = 0;

while (!isCancelled() && Date.now() - farmStart < 140000) {
  if (globalThis.activeAssaultId !== myAssaultId) break;

  if (bot.health <= 6) {
    // Stay low behind cover, do not run across open bridge!
    await sleep(1000);
    continue;
  }

  // Find Blazes within melee reach (4.8m)
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

  // Vacuum drops
  if (bot.entity.position.x >= 35.5 && Math.random() < 0.25) {
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

try { if (bot.entity.position.x >= 35.5) await lib.pickup(4.0); } catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log(`Round ended. Blaze Rods: ${finalRods}, HP: ${bot.health}, Pos: ${lib.fmt(bot.entity.position)}`);

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
