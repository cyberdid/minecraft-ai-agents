// programs/419-sprint-nether-spawner.js
console.log('=== FOUR-PLAYER SPAWNER ASSAULT (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Enter Nether portal
if (bot.game.dimension === 'overworld') {
  console.log('Entering Nether portal...');
  await globalThis.enterNetherPortal();
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Not in Nether:', bot.game.dimension);
  return;
}

bot.chat('gamma: In Nether! Fast marching with team to Spawner Pillbox (36, 66, -187)!');

// Strict fire avoidance
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
  new Vec3(37, 66, -184), // Pillbox Covered Entry
  new Vec3(36.5, 66, -186.5) // Spawner Pillbox Firing Station
];

// March loop with active combat against any blocking Piglins
for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.2) continue;

  // Active mob defense: attack any piglin / mob within 4 blocks
  const piglin = bot.nearestEntity(e => (e.name === 'piglin' || e.name === 'piglin_brute') && e.position.distanceTo(bot.entity.position) <= 4.5);
  if (piglin) {
    console.log(`Defending against Piglin at dist=${bot.entity.position.distanceTo(piglin.position).toFixed(1)}!`);
    await bot.lookAt(piglin.position.offset(0, 1.2, 0), true);
    bot.attack(piglin);
    await sleep(650);
    bot.attack(piglin);
    await sleep(650);
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

  if (bot.health <= 7) {
    console.log(`Health low (${bot.health}) at WP ${i + 1}, breaking to cover.`);
    break;
  }
}

// Check distance to Spawner Pillbox
const pillboxPos = new Vec3(36.5, 66, -186.5);
const dist = bot.entity.position.distanceTo(pillboxPos);
console.log(`Pillbox dist: ${dist.toFixed(1)}m. Dim: ${bot.game.dimension}, HP: ${bot.health}`);

if (bot.game.dimension === 'the_nether' && dist <= 8) {
  bot.chat('gamma: Inside Spawner Pillbox! Slaying Blazes shoulder-to-shoulder with team!');
  console.log('Farming Blazes at Pillbox...');
  const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 120000);
  console.log('Farm completed:', JSON.stringify(farmRes));

  const totalRods = lib.count('blaze_rod');
  console.log(`Blaze Rods in inventory: ${totalRods}`);
  if (totalRods >= 8) {
    bot.chat(`gamma: MILESTONE 8 COMPLETE! Secured ${totalRods} Blaze Rods!`);
    await globalThis.retreatToOverworldBase();
  }
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: lib.count('blaze_rod'),
  inv: lib.inv()
};
