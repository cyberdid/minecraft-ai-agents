// programs/271-transit-and-sprint-to-frontline.js
console.log('=== TRANSIT TO NETHER & SPRINT TO DELTA AT FRONTLINE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Step out base door
console.log('Stepping out base door to portal...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(294.5, -52.0, 3000); } catch (e2) {}
}

// 2. Step into exact center of Nether portal (299.5, 73.0, -53.5)
console.log('Approaching portal...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 8000 });
} catch (e) {
  await lib.walkTo(299.5, -52.0, 3000);
}

bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Inside portal! Pos:', lib.fmt(bot.entity.position), 'Block:', bot.blockAt(bot.entity.position)?.name);
console.log('Standing still for dimension change...');

const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);

// CRITICAL DIMENSION GUARD
if (!String(bot.game.dimension).includes('nether')) {
  console.log('ERROR: Did not transit to Nether! Aborting to prevent overworld wander.');
  bot.chat('gamma transit timed out, holding at base.');
  return;
}

console.log('=== ARRIVED IN THE NETHER BUNKER ===');
await sleep(400);

// 3. Step strictly to z = -8.0 (completely avoids the z > -7 fire drop!)
await lib.walkTo(40.5, -8.0, 2000);
bot.clearControlStates();
console.log('Safe bunker exit at:', lib.fmt(bot.entity.position));

bot.chat('gamma in Nether! Marching along proven safe z<=-8 trail to join Delta at frontline!');

// 4. Dense waypoints along z = -8 to reach East Ridge Head (63, 65, -8)
const toRidge = [
  new Vec3(48, 65, -8),
  new Vec3(56, 65, -8),
  new Vec3(63, 65, -8)
];

for (const wp of toRidge) {
  if (!String(bot.game.dimension).includes('nether')) return;
  console.log(`Walking to waypoint ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1, { timeoutMs: 12000 });
  } catch (e) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 8000 }); } catch (e2) {}
  }
}
console.log('Reached East Ridge Head! Pos:', lib.fmt(bot.entity.position));

// Check and pickup any dropped items on ridge head
try {
  await lib.pickup(10);
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

// 5. March North strictly along x = 62.5
const northWaypoints = [
  new Vec3(62.5, 66, -30),
  new Vec3(62.5, 66, -50),
  new Vec3(62.5, 67, -70),
  new Vec3(62.5, 67, -85),
  new Vec3(61.5, 66, -100),
  new Vec3(50.0, 65, -115),
  new Vec3(44.0, 65, -127), // Fortress Workshop Bunker
  new Vec3(44.0, 65, -145), // Covered Advance Tunnel
  new Vec3(44.0, 65, -168)  // Delta Frontline!
];

for (let i = 0; i < northWaypoints.length && !isCancelled(); i++) {
  if (!String(bot.game.dimension).includes('nether')) return;
  const wp = northWaypoints[i];
  console.log(`Advancing North to WP ${i + 1}: ${lib.fmt(wp)} (dist: ${bot.entity.position.distanceTo(wp).toFixed(1)}m)...`);

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 16000 });
    console.log(`Reached WP ${i + 1} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`goTo note for WP ${i + 1}: ${e.message}`);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 10000 });
      console.log(`Reached WP ${i + 1} via goToXZ at ${lib.fmt(bot.entity.position)}`);
    } catch (e2) {}
  }

  // Pickup any items dropped along the covered tunnel
  if (i >= 6) {
    try {
      await lib.pickup(6);
      await lib.equipWeapon();
      await lib.equipArmor();
    } catch (e) {}
  }
}

console.log('=== MARCH COMPLETE ===');
console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Inv:', JSON.stringify(lib.inv()));

const spawnerDist = bot.entity.position.distanceTo(new Vec3(32, 68, -190)).toFixed(1);
console.log(`Distance to Blaze Spawner (32, 68, -190): ${spawnerDist}m`);

// Check teammates
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Teammate ${p.username} at ${lib.fmt(p.entity.position)} dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m held=${p.entity.heldItem?.name || 'none'}`);
  }
}

bot.chat(`gamma united with Delta at frontline (${lib.fmt(bot.entity.position)})! Dist to Spawner: ${spawnerDist}m. Ready to farm Blaze Rods!`);
