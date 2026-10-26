// programs/260-march-to-spawner-front.js
console.log('=== TRANSIT & DENSE-WAYPOINT MARCH TO FORTRESS FRONT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Check base chest for weapons/tools before leaving
try {
  const chest = await bot.openContainer(bot.blockAt(new Vec3(293, 72, -57)));
  for (const it of chest.items()) {
    if (['stone_sword', 'iron_sword', 'stone_pickaxe', 'shield', 'cobblestone', 'cooked_beef', 'bread'].includes(it.name)) {
      console.log(`Taking ${it.name} x${it.count} from base chest...`);
      await chest.withdraw(it.type, null, it.count);
    }
  }
  await chest.close();
} catch (e) {}

// Equip any gear we found
try { await lib.equipWeapon(); } catch (e) {}
try { await lib.equipArmor(); } catch (e) {}
console.log('Inv before transit:', JSON.stringify(lib.inv()));

// 2. Step outside base door
console.log('Stepping outside base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(294.5, -52.5, 3000); } catch (e2) {}
}

// 3. Step into exact center of Nether portal (299.5, 73.0, -53.5)
console.log('Approaching portal...');
await lib.goTo(299, 72, -52, 1, { timeoutMs: 8000 });
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

// CRITICAL DIMENSION GUARD: Only execute Nether march if physically in the_nether!
if (!String(bot.game.dimension).includes('nether')) {
  console.log('ERROR: Did not transit to Nether! Aborting to prevent overworld wander.');
  bot.chat('gamma portal transit timed out; holding at base.');
  return;
}

console.log('=== IN THE NETHER! ===');
await sleep(400);

// Step out of portal hitbox to (40.5, 65.0, -6.5)
await lib.walkTo(40.5, -6.5, 2000);
bot.clearControlStates();

bot.chat('gamma in Nether! Marching along strict East Ridge (x=62.5) to Fortress front!');

// 4. March directly to East Ridge Head (62.5, 65.0, -5.0)
console.log('Marching to East Ridge Head (62.5, 65.0, -5.0)...');
try {
  await lib.goTo(62.5, 65, -5, 1, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.goToXZ(62.5, -5, { timeoutMs: 10000 }); } catch (e2) {}
}

// 5. Strict East Ridge march along x=62.5 with dense 10m waypoints
const ridgeWaypoints = [
  new Vec3(62.5, 65, -15),
  new Vec3(62.5, 66, -30),
  new Vec3(62.5, 66, -45),
  new Vec3(62.5, 67, -60),
  new Vec3(62.5, 67, -75),
  new Vec3(62.5, 67, -90),
  new Vec3(61.5, 66, -100),
  new Vec3(50.0, 65, -115),
  new Vec3(44.0, 65, -127), // Fortress Workshop Bunker
  new Vec3(44.0, 65, -145), // Covered Advance Tunnel
  new Vec3(44.0, 65, -169)  // Alpha & Beta Frontline!
];

for (let i = 0; i < ridgeWaypoints.length && !isCancelled(); i++) {
  // Dimension check before each waypoint
  if (!String(bot.game.dimension).includes('nether')) {
    console.log('ABORT: No longer in Nether!');
    return;
  }

  const wp = ridgeWaypoints[i];
  console.log(`\nAdvancing to WP ${i + 1}: ${lib.fmt(wp)} (dist: ${bot.entity.position.distanceTo(wp).toFixed(1)}m)...`);

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 20000 });
    console.log(`Reached WP ${i + 1} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`goTo note for WP ${i + 1}: ${e.message}`);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 12000 });
      console.log(`Reached WP ${i + 1} via goToXZ at ${lib.fmt(bot.entity.position)}`);
    } catch (e2) {
      console.log(`goToXZ note for WP ${i + 1}: ${e2.message}`);
    }
  }

  // Check health
  if (bot.health <= 6) {
    console.log('WARNING: Health critical! HP:', bot.health);
  }
}

console.log('\n=== MARCH COMPLETED ===');
console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// Distance to Blaze Spawner
const distToSpawner = bot.entity.position.distanceTo(new Vec3(32, 68, -190)).toFixed(1);
console.log(`Distance to Blaze Spawner (32, 68, -190): ${distToSpawner}m`);

// Check nearby teammates
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Teammate ${p.username} at ${lib.fmt(p.entity.position)} dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

bot.chat(`gamma united at frontline (${lib.fmt(bot.entity.position)})! Dist to Spawner: ${distToSpawner}m. Ready to farm Blaze Rods!`);
