// programs/337-safe-fire-march-to-spawner.js
console.log('=== FIRE-SAFE ADVANCE TO BLAZE SPAWNER ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food, 'Cobblestone:', lib.count('cobblestone'));

// Equip stone sword
await lib.equipWeapon();

// Safe fire extinguishing helper
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
        console.log(`Extinguishing fire at ${lib.fmt(fp)}...`);
        await bot.dig(b);
      }
    } catch (e) {}
  }
}

// 1. Step south out of portal frame
console.log('Stepping out of portal to (40.5, 65, -8.5)...');
bot.clearControlStates();
await lib.walkTo(40.5, -8.5, 2000);
bot.clearControlStates();
await extinguishNearbyHazards();

// 2. Full sequence of waypoints from bunker to Spawner Balcony
const marchWaypoints = [
  // Valley floor
  { name: 'Valley 1', pos: new Vec3(48.0, 65.0, -8.0) },
  { name: 'Valley 2', pos: new Vec3(56.0, 65.0, -8.0) },
  { name: 'East Ridge Entry', pos: new Vec3(63.0, 65.0, -8.0) },
  // East Ridge trail
  { name: 'Ridge South', pos: new Vec3(63.0, 65.0, -15.0) },
  { name: 'Ridge Mid-South', pos: new Vec3(62.5, 66.0, -30.0) },
  { name: 'Ridge Mid-Caution (z=-42)', pos: new Vec3(62.5, 66.0, -42.0) },
  { name: 'Ridge Mid', pos: new Vec3(62.0, 65.0, -55.0) },
  { name: 'Ridge North-Caution (z=-70)', pos: new Vec3(62.0, 66.0, -70.0) },
  { name: 'Ridge North', pos: new Vec3(62.0, 66.0, -80.0) },
  { name: 'Ridge North Bend', pos: new Vec3(61.0, 66.0, -100.0) },
  { name: 'Fortress Approach', pos: new Vec3(50.0, 65.0, -115.0) },
  { name: 'Fortress Workshop Bunker', pos: new Vec3(44.0, 65.0, -127.0) },
  // Covered Advance Tunnel
  { name: 'Covered Tunnel Mid', pos: new Vec3(44.0, 65.0, -145.0) },
  { name: 'Covered Tunnel North', pos: new Vec3(44.0, 65.0, -160.0) },
  { name: 'Frontline Blast Wall', pos: new Vec3(44.0, 65.0, -169.0) },
  { name: 'Fortified Cross-Bridge', pos: new Vec3(38.0, 65.0, -176.0) },
  { name: 'Spawner Balcony Deck', pos: new Vec3(34.0, 67.0, -187.0) }
];

for (let i = 0; i < marchWaypoints.length && !isCancelled(); i++) {
  const wp = marchWaypoints[i];
  console.log(`[WP ${i + 1}/${marchWaypoints.length}] ${wp.name} at ${lib.fmt(wp.pos)}...`);

  await extinguishNearbyHazards();

  try {
    await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 1.5, { timeoutMs: 10000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 8000 });
    } catch (e2) {
      console.log(`Movement note to ${wp.name}:`, e2.message);
    }
  }

  await extinguishNearbyHazards();
  try { await lib.pickup(4); } catch (e) {}

  // Check health and hostiles
  if (bot.health <= 8) {
    console.log('WARNING: Health low:', bot.health);
  }
}

console.log('\n=== ADVANCE PROGRESS ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Cobblestone:', lib.count('cobblestone'));

// Scan for Blazes and Spawner
const spawners = bot.findBlocks({ matching: b => b && b.name === 'spawner', maxDistance: 24, count: 2 });
console.log(`Spawners visible (${spawners.length}):`, spawners.map(p => lib.fmt(p)));

const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze');
console.log(`Blazes visible (${blazes.length}):`, blazes.map(b => `${b.name} at ${lib.fmt(b.position)} (dist: ${bot.entity.position.distanceTo(b.position).toFixed(1)}m)`));

bot.chat(`gamma reached ${lib.fmt(bot.entity.position)} at Nether Frontline! Cobble: ${lib.count('cobblestone')}, HP: ${bot.health}/20`);
