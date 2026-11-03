// programs/405-step-into-portal-and-assault.js
console.log('=== STEP INTO PORTAL & SPAWNER ASSAULT ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food, 'Inv:', JSON.stringify(lib.inv()));

// 1. Equip weapon
await lib.equipWeapon();

// 2. If in overworld, step forward into portal block
if (bot.game.dimension !== 'the_nether') {
  console.log('Stepping into portal block at (298.5, 73.0, -54.0)...');
  await bot.lookAt(new Vec3(298.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);

  // Warp loop
  console.log('Waiting for Nether transit...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    if (Math.abs(bot.entity.position.z - (-54.0)) > 0.4 || Math.abs(bot.entity.position.x - 298.5) > 0.6) {
      await bot.lookAt(new Vec3(298.5, 73.0, -54.0), true);
      bot.setControlState('forward', true);
      await sleep(250);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension !== 'the_nether') {
  console.log('Warp not completed! Pos:', lib.fmt(bot.entity.position));
  return { error: 'Warp failed', pos: bot.entity.position, dim: bot.game.dimension };
}

bot.chat('gamma: In Nether! Fast-marching 16 waypoints along safe East Ridge to Spawner Pillbox.');

// 3. In Nether: Step out of portal
await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1200);
bot.setControlState('forward', false);

if (typeof configureFireAvoidance === 'function') configureFireAvoidance();

// 16 safe ridge waypoints
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
    console.log(`HP low (${bot.health}), taking cover!`);
    break;
  }
}

console.log('Arrived at Spawner Front! Pos:', lib.fmt(bot.entity.position));
bot.chat('gamma: At Spawner Pillbox (36, 66, -187)! Slaying Blazes alongside team!');

// 4. Combat & Blaze Rod farming
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

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  rods: lib.count('blaze_rod'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
