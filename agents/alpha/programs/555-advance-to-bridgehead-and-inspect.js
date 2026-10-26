// programs/555-advance-to-bridgehead-and-inspect.js
console.log('=== Program 555: Advance to Bridgehead & Inspect Beta Bridge ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

await lib.equipWeapon();

// Safe waypoints through covered corridor to Spawner Bridgehead
const corridorWaypoints = [
  new Vec3(44, 65, -135),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -163),
  new Vec3(44, 65, -174)
];

async function pickupNearby() {
  const drops = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8);
  if (drops.length > 0) {
    try { await lib.pickup(8); } catch (e) {}
  }
}

for (let i = 0; i < corridorWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = corridorWaypoints[i];
  const dist = bot.entity.position.distanceTo(wp);
  if (dist < 2.0) {
    console.log(`Already at WP ${i + 1} (${lib.fmt(wp)})`);
    continue;
  }
  
  console.log(`Navigating corridor WP ${i + 1}/${corridorWaypoints.length}: ${lib.fmt(wp)} (dist: ${dist.toFixed(1)}m)...`);
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { dig: false, timeoutMs: 12000 });
  } catch (err) {
    console.log(`lib.goTo to WP ${i + 1} failed: ${err.message}. Direct movement fallback...`);
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1500);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
  }
  
  await pickupNearby();
  console.log(`Pos after WP ${i + 1}: ${lib.fmt(bot.entity.position)}`);
}

console.log('Arrived at Spawner Bridgehead area! Current pos:', lib.fmt(bot.entity.position));
await pickupNearby();

// Inspect the bridge along z=-174..-176 and towards x=38..32
console.log('--- Inspecting Bridge & Surroundings ---');
for (let x = 44; x >= 36; x--) {
  for (let z = -174; z >= -178; z--) {
    const floor = bot.blockAt(new Vec3(x, 64, z))?.name || 'air';
    const feet = bot.blockAt(new Vec3(x, 65, z))?.name || 'air';
    const head = bot.blockAt(new Vec3(x, 66, z))?.name || 'air';
    if (floor !== 'air' || feet !== 'air' || head !== 'air') {
      console.log(`(${x}, ${z}): floor(64)=${floor}, feet(65)=${feet}, head(66)=${head}`);
    }
  }
}

// Check hostiles within 32m
const hostiles = lib.hostiles(32);
console.log(`Hostiles within 32m (${hostiles.length}):`, hostiles.map(h => `${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m)`));

// Check distance to Blaze Spawner at (32, 68, -190)
const spawnerPos = new Vec3(32, 68, -190);
const distToSpawner = bot.entity.position.distanceTo(spawnerPos);
console.log(`Distance to Blaze Spawner at (32, 68, -190): ${distToSpawner.toFixed(1)}m`);

bot.chat(`alpha: At Spawner Bridgehead ${lib.fmt(bot.entity.position)}! Spawner dist: ${distToSpawner.toFixed(1)}m. Hostiles: ${hostiles.length}`);
