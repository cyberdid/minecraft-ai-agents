// programs/407-enter-nether-portal-properly.js
console.log('=== ENTER NETHER VIA PORTAL OPENING (x=299.5) & ASSAULT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food, 'Cobble:', lib.count('cobblestone'));

// 1. Equip weapon
await lib.equipWeapon();

// 2. Step into portal opening at x=299.5, y=73, z=-54.0
if (bot.game.dimension !== 'the_nether') {
  console.log('Moving into active portal block at (299.5, 73.0, -54.0)...');
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
  await sleep(1200);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  // Stand directly inside portal block (299.5, 73.0, -54.0)
  const warpStart = Date.now();
  console.log('Standing inside portal hitbox, awaiting Nether dimension...');
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - 299.5) > 0.4 || Math.abs(cur.z - (-54.0)) > 0.4 || cur.y < 72.8) {
      await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(250);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }
}

console.log('Dimension after warp check:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension !== 'the_nether') {
  console.log('Warp failed! Pos:', lib.fmt(bot.entity.position));
  return { error: 'Warp failed', dim: bot.game.dimension, pos: bot.entity.position };
}

bot.chat('gamma: Successfully transited to Nether! Fast-marching 16 waypoints to Spawner Pillbox.');

// 3. In Nether: Step out of portal
await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1200);
bot.setControlState('forward', false);

if (typeof configureFireAvoidance === 'function') configureFireAvoidance();

// 16 safe ridge waypoints to Spawner Balcony Pillbox
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
    console.log(`HP low (${bot.health}), taking cover behind nearest wall!`);
    break;
  }
}

console.log('Arrived at Spawner Front! Pos:', lib.fmt(bot.entity.position));
bot.chat('gamma: At Spawner Pillbox (36, 66, -187)! Engaging Blazes alongside team!');

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
