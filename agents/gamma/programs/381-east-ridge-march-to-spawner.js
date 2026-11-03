// programs/381-east-ridge-march-to-spawner.js
console.log('=== NETHER RIDGE MARCH TO SPAWNER BALCONY ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food, 'Cobblestone:', lib.count('cobblestone'));

// Equip stone sword
await lib.equipWeapon();

// Configure strict fire avoidance
if (typeof configureFireAvoidance === 'function') {
  configureFireAvoidance();
}

async function extinguishNearbyHazards() {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 6,
    count: 8
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b && (b.name === 'fire' || b.name === 'soul_fire')) {
        await bot.dig(b);
      }
    } catch (e) {}
  }
}

// 1. Step clear of portal
try {
  await lib.walkTo(40.5, -8.5, 2000);
} catch (e) {}
bot.clearControlStates();
await extinguishNearbyHazards();

// 2. Full sequence of waypoints from bunker to Spawner Balcony
const marchWaypoints = [
  { name: 'Valley 1', pos: new Vec3(48.0, 65.0, -8.0) },
  { name: 'Valley 2', pos: new Vec3(56.0, 65.0, -8.0) },
  { name: 'East Ridge Entry', pos: new Vec3(63.0, 65.0, -8.0) },
  { name: 'Ridge South', pos: new Vec3(63.0, 65.0, -15.0) },
  { name: 'Ridge Mid-South', pos: new Vec3(62.5, 66.0, -30.0) },
  { name: 'Ridge Mid-Caution (z=-42)', pos: new Vec3(62.5, 66.0, -42.0) },
  { name: 'Ridge Mid', pos: new Vec3(62.0, 65.0, -55.0) },
  { name: 'Ridge North-Caution (z=-70)', pos: new Vec3(62.0, 66.0, -70.0) },
  { name: 'Ridge North', pos: new Vec3(62.0, 66.0, -80.0) },
  { name: 'Ridge North Bend', pos: new Vec3(61.0, 66.0, -100.0) },
  { name: 'Fortress Approach', pos: new Vec3(50.0, 65.0, -115.0) },
  { name: 'Fortress Workshop Bunker', pos: new Vec3(44.0, 65.0, -127.0) },
  { name: 'Covered Tunnel Mid', pos: new Vec3(44.0, 65.0, -145.0) },
  { name: 'Covered Tunnel North', pos: new Vec3(44.0, 65.0, -160.0) },
  { name: 'Frontline Blast Wall', pos: new Vec3(44.0, 65.0, -169.0) },
  { name: 'Fortified Cross-Bridge', pos: new Vec3(38.0, 65.0, -176.0) },
  { name: 'Spawner Balcony Deck', pos: new Vec3(35.0, 66.0, -187.0) }
];

for (let i = 0; i < marchWaypoints.length && !isCancelled(); i++) {
  const wp = marchWaypoints[i];
  console.log(`[WP ${i + 1}/${marchWaypoints.length}] ${wp.name}...`);
  await extinguishNearbyHazards();

  try {
    await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 1.5, { timeoutMs: 12000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 10000 });
    } catch (e2) {
      console.log(`Navigation note to ${wp.name}:`, e2.message);
    }
  }

  await extinguishNearbyHazards();
  try { await lib.pickup(4); } catch (e) {}

  if (bot.health <= 8) {
    console.log('CRITICAL: Health dropped to', bot.health, '- holding behind cover!');
    break;
  }
}

console.log('Arrived at Spawner Balcony! Pos:', lib.fmt(bot.entity.position));

// Pickup any dropped gear from Alpha/Delta/Beta
try {
  const picked = await lib.pickup(8);
  console.log('Picked up dropped items at spawner front:', picked);
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

// Slay Blazes from behind pillbox wall
bot.chat('gamma: at Spawner Pillbox! Engaging Blazes for Milestone 8!');
const combatDeadline = Date.now() + 45000;
let initialRods = lib.count('blaze_rod');

while (Date.now() < combatDeadline && !isCancelled()) {
  if (bot.health <= 8) {
    console.log('Health low (', bot.health, ') - falling back behind blast wall at (44, 65, -169)!');
    try { await lib.goTo(44, 65, -169, 1.5, { timeoutMs: 5000 }); } catch (e) {}
    break;
  }

  // Find nearest Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e && e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 4.5)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  if (blazes.length > 0) {
    const target = blazes[0];
    await bot.lookAt(target.position.offset(0, target.height * 0.5, 0));
    bot.attack(target);
    await sleep(550);
    await lib.pickup(5);
  } else {
    await lib.pickup(5);
    await sleep(600);
  }

  const currentRods = lib.count('blaze_rod');
  if (currentRods > initialRods) {
    console.log(`*** BLAZE ROD HARVESTED! Total: ${currentRods} ***`);
    bot.chat(`gamma: harvested Blaze Rod! Total: ${currentRods}`);
    initialRods = currentRods;
  }
}

console.log('Combat round ended. Blaze rods in inv:', lib.count('blaze_rod'), 'HP:', bot.health);
console.log('Final status:', JSON.stringify(lib.status()));
