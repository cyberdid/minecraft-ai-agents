// programs/269-hold-transit-and-safe-ridge.js
console.log('=== TRANSIT & SAFE RIDGE MARCH (z <= -7) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

bot.clearControlStates();

// 1. Wait for dimension change (up to 15s)
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);

// CRITICAL DIMENSION GUARD
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Aborting: Not in Nether!');
  return;
}

console.log('=== ARRIVED IN THE NETHER BUNKER ===');
await sleep(400);

// 2. Step strictly to z = -8.0 (completely avoids the z > -7 fire drop!)
await lib.walkTo(40.5, -8.0, 2000);
bot.clearControlStates();
console.log('Safe bunker exit at:', lib.fmt(bot.entity.position));

bot.chat('gamma in Nether! Marching strictly along z<=-8 safe trail to East Ridge!');

// 3. Dense waypoints along z = -8 to reach East Ridge Head (63, 65, -8)
const toRidgeWaypoints = [
  new Vec3(48, 65, -8),
  new Vec3(56, 65, -8),
  new Vec3(63, 65, -8)
];

for (const wp of toRidgeWaypoints) {
  if (!String(bot.game.dimension).includes('nether')) return;
  console.log(`Walking to safe waypoint ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1, { timeoutMs: 12000 });
  } catch (e) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 8000 }); } catch (e2) {}
  }
}
console.log('Reached East Ridge Head! Pos:', lib.fmt(bot.entity.position));

// Check and pickup any dropped items on ridge head
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 12);
if (items.length > 0) {
  console.log(`Found ${items.length} items on ridge head! Picking up...`);
  await lib.pickup(8);
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
}

// 4. March North strictly along x = 62.5
const northWaypoints = [
  new Vec3(62.5, 66, -30),
  new Vec3(62.5, 66, -50),
  new Vec3(62.5, 67, -70),
  new Vec3(62.5, 67, -85),
  new Vec3(61.5, 66, -100),
  new Vec3(50.0, 65, -115),
  new Vec3(44.0, 65, -127), // Fortress Workshop Bunker
  new Vec3(44.0, 65, -145), // Covered Advance Tunnel
  new Vec3(44.0, 65, -169)  // Alpha & Beta Frontline!
];

for (let i = 0; i < northWaypoints.length && !isCancelled(); i++) {
  if (!String(bot.game.dimension).includes('nether')) return;
  const wp = northWaypoints[i];
  console.log(`Advancing North to WP ${i + 1}: ${lib.fmt(wp)} (dist: ${bot.entity.position.distanceTo(wp).toFixed(1)}m)...`);

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 18000 });
    console.log(`Reached WP ${i + 1} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`goTo note: ${e.message}`);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 10000 });
      console.log(`Reached WP ${i + 1} via goToXZ at ${lib.fmt(bot.entity.position)}`);
    } catch (e2) {}
  }

  // Check health
  if (bot.health <= 6) console.log('WARNING: Health critical! HP:', bot.health);
}

console.log('=== MARCH COMPLETE ===');
console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));

const spawnerDist = bot.entity.position.distanceTo(new Vec3(32, 68, -190)).toFixed(1);
console.log(`Distance to Blaze Spawner (32, 68, -190): ${spawnerDist}m`);

bot.chat(`gamma united at frontline (${lib.fmt(bot.entity.position)})! Dist to Blaze Spawner: ${spawnerDist}m.`);
