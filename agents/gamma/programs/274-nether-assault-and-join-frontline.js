// programs/274-nether-assault-and-join-frontline.js
console.log('=== NETHER ASSAULT & MARCH TO SPAWNER FRONTLINE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food, 'Held:', bot.entity.equipment[0]?.name);
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Walk to portal at (299.5, 73.0, -53.5)
console.log('Walking to Nether portal...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 10000 });
} catch (e) {
  try { await lib.walkTo(299.5, -52.0, 3000); } catch (e2) {}
}

bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Inside portal! Pos:', lib.fmt(bot.entity.position));
console.log('Standing still for dimension change...');

const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);

// CRITICAL DIMENSION GUARD
if (!String(bot.game.dimension).includes('nether')) {
  console.log('ERROR: Did not transit to Nether! Aborting.');
  bot.chat('gamma transit timed out; holding at portal.');
  return;
}

console.log('=== ARRIVED IN THE NETHER BUNKER ===');
await sleep(400);

// 2. Safe exit strictly at z = -8.0
await lib.walkTo(40.5, -8.0, 2000);
bot.clearControlStates();
console.log('Safe bunker exit at:', lib.fmt(bot.entity.position));

bot.chat('gamma in Nether armed with stone sword! Marching along z<=-8 safe trail to join team at Spawner!');

// 3. Follow z = -8.0 to East Ridge Head (63, 65, -8)
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

// 4. Combat check: Eliminate any skeleton or hostile at Ridge Head
const hostilesNear = lib.hostiles(10);
if (hostilesNear.length > 0) {
  console.log(`Hostile detected near ridge head: ${hostilesNear[0].name} at dist ${hostilesNear[0].dist.toFixed(1)}m!`);
  await lib.equipWeapon();
  try {
    await lib.fight(8, 8);
    console.log('Hostile defeated!');
  } catch (e) {
    console.log('Fight note:', e.message);
  }
}

// Pickup drops
try {
  await lib.pickup(10);
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

// 5. March North strictly along x = 62.5
const northTrail = [
  new Vec3(62.5, 66, -30),
  new Vec3(62.5, 66, -50),
  new Vec3(62.5, 67, -70),
  new Vec3(62.5, 67, -85),
  new Vec3(61.5, 66, -100),
  new Vec3(50.0, 65, -115),
  new Vec3(44.0, 65, -127), // Fortress Workshop Bunker
  new Vec3(44.0, 65, -145), // Covered Advance Tunnel
  new Vec3(44.0, 65, -168), // Delta Frontline
  new Vec3(39.0, 65, -176)  // Spawner Bridgehead!
];

for (let i = 0; i < northTrail.length && !isCancelled(); i++) {
  if (!String(bot.game.dimension).includes('nether')) return;
  const wp = northTrail[i];
  console.log(`Advancing North to WP ${i + 1}: ${lib.fmt(wp)} (dist: ${bot.entity.position.distanceTo(wp).toFixed(1)}m)...`);

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 16000 });
    console.log(`Reached WP ${i + 1} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 10000 });
      console.log(`Reached WP ${i + 1} via goToXZ at ${lib.fmt(bot.entity.position)}`);
    } catch (e2) {}
  }

  // Pickup along covered tunnel
  if (i >= 6) {
    try {
      await lib.pickup(6);
      await lib.equipWeapon();
      await lib.equipArmor();
    } catch (e) {}
  }
}

console.log('=== ARRIVED AT FRONTLINE ===');
console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Inv:', JSON.stringify(lib.inv()));

const distSpawner = bot.entity.position.distanceTo(new Vec3(32, 68, -190)).toFixed(1);
console.log(`Distance to Blaze Spawner (32, 68, -190): ${distSpawner}m`);

// Check teammates
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Teammate ${p.username} at ${lib.fmt(p.entity.position)} dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m held=${p.entity.heldItem?.name || 'none'}`);
  }
}

bot.chat(`gamma united with team at Spawner bridgehead (${lib.fmt(bot.entity.position)})! Dist to Spawner: ${distSpawner}m. Ready to farm Blaze Rods!`);
