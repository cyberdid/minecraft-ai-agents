// programs/408-enter-portal-and-assault.js
console.log('=== EXACT PORTAL TRANSIT & SPAWNER ASSAULT ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Equip stone sword
await lib.equipWeapon();

// 2. Step into exact nether_portal block at (299.5, 73.0, -53.5)
if (bot.game.dimension !== 'the_nether') {
  console.log('Stepping directly into portal block center at (299.5, 73.0, -53.5)...');
  const portalCenter = new Vec3(299.5, 73.0, -53.5);
  await bot.lookAt(portalCenter, true);
  bot.setControlState('forward', true);
  const t0 = Date.now();
  while (bot.entity.position.distanceTo(portalCenter) > 0.25 && Date.now() - t0 < 3000) {
    await sleep(50);
  }
  bot.clearControlStates();
  bot.pathfinder.setGoal(null);

  console.log('Inside portal frame! Waiting for Nether warp (4s motionless)...');
  const warpDeadline = Date.now() + 25000;
  while (bot.game.dimension !== 'the_nether' && Date.now() < warpDeadline && !isCancelled()) {
    await sleep(500);
  }
}

if (bot.game.dimension !== 'the_nether') {
  console.log('ERROR: Dimension transit did not trigger. Ending at:', bot.game.dimension, lib.fmt(bot.entity.position));
  return;
}

console.log('WARP SUCCESS! Inside the_nether at pos:', lib.fmt(bot.entity.position));
bot.chat('gamma: In Nether! Fast-marching 16 waypoints to Spawner Pillbox.');

// Step out of Nether portal frame
try {
  await lib.walkTo(40.5, -8.5, 2000);
} catch (e) {}

if (typeof configureFireAvoidance === 'function') configureFireAvoidance();

// 16 safe East Ridge waypoints to Spawner Pillbox
const waypoints = [
  new Vec3(46, 65, -7),
  new Vec3(54, 65, -7),
  new Vec3(63, 64, -7),
  new Vec3(63, 65, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127), // Fortress Workshop Bunker
  new Vec3(44, 65, -145), // Covered Tunnel
  new Vec3(44, 65, -160),
  new Vec3(44, 65, -169), // Blast Wall
  new Vec3(38, 65, -176), // Cross Bridge
  new Vec3(36, 66, -187)  // Spawner Pillbox
];

console.log('Marching along 16 safe ridge waypoints...');
for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(wp) < 3.0) continue;
  console.log(`[WP ${i + 1}/${waypoints.length}] to (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { timeoutMs: 12000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 8000 });
    } catch (e2) {}
  }

  try { await lib.pickup(4); } catch (e) {}

  if (bot.health <= 8) {
    console.log(`HP low (${bot.health}), taking cover behind blast wall!`);
    break;
  }
}

console.log('Arrived at Spawner Front! Pos:', lib.fmt(bot.entity.position));
bot.chat('gamma: At Spawner Pillbox (36, 66, -187)! Slaying Blazes alongside team!');

// Combat & Blaze Rod farming
const combatDeadline = Date.now() + 45000;
let initialRods = lib.count('blaze_rod');

while (Date.now() < combatDeadline && !isCancelled()) {
  if (bot.health <= 10) {
    console.log(`Health warning: HP=${bot.health}. Retreating behind blast wall!`);
    bot.chat('gamma: HP low, tactical retreat to blast wall at (44, 65, -169)!');
    try { await lib.goTo(44, 65, -169, 1.5, { timeoutMs: 5000 }); } catch (e) {}
    break;
  }

  const blaze = bot.nearestEntity(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) <= 4.5);
  if (blaze) {
    console.log(`Attacking Blaze at ${lib.fmt(blaze.position)}...`);
    await bot.lookAt(blaze.position.offset(0, 1.2, 0), true);
    bot.attack(blaze);
    await sleep(650);
    bot.attack(blaze);
    await sleep(650);
  } else {
    try { await lib.pickup(4); } catch (e) {}
    await sleep(800);
  }

  const rodsNow = lib.count('blaze_rod');
  if (rodsNow > initialRods) {
    console.log(`*** BLAZE ROD COLLECTED! Total: ${rodsNow} ***`);
    bot.chat(`gamma: Harvested Blaze Rod! Total in inventory: ${rodsNow}`);
    initialRods = rodsNow;
  }
}

try { await lib.pickup(6); } catch (e) {}
console.log('Expedition round complete! Final inv:', JSON.stringify(lib.inv()));
console.log('Final status:', JSON.stringify(lib.status()));
