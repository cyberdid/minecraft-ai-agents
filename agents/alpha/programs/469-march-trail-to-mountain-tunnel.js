// programs/469-march-trail-to-mountain-tunnel.js
console.log('=== Program 469: March Trail to Mountain Tunnel & Unite with Delta ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(200);

// Helper to clear fire in path
async function clearFire() {
  const fires = bot.findBlocks({
    matching: b => b.name === 'fire' || b.name === 'soul_fire',
    maxDistance: 6,
    count: 6
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b);
    } catch (e) {}
  }
}

// Check nearby dropped items
async function pickupNearby() {
  const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8);
  if (items.length > 0) {
    console.log(`Found ${items.length} items nearby, picking up...`);
    try { await lib.pickup(8); } catch (e) {}
  }
}

// Proven waypoints from Delta's program 216
const ridgeWaypoints = [
  new Vec3(63, 64, -5),
  new Vec3(63, 66, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -127),
  new Vec3(44, 65, -135),
  new Vec3(44, 65, -146),
  new Vec3(44, 65, -149),
  new Vec3(44, 65, -160),
  new Vec3(37, 65, -175)
];

for (const wp of ridgeWaypoints) {
  if (isCancelled()) break;
  // If we already passed this waypoint along -z, skip it
  if (bot.entity.position.z < wp.z - 3) continue;

  console.log(`Advancing to ${lib.fmt(wp)}...`);
  await clearFire();
  await pickupNearby();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached ${lib.fmt(wp)}! Pos: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Path note at ${lib.fmt(wp)}: ${err.message}`);
    // Fallback direct movement
    try {
      await bot.lookAt(new Vec3(wp.x, wp.y + 0.5, wp.z), true);
      bot.setControlState('forward', true);
      await sleep(1000);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }

  // Check nearby teammates
  for (const [name, p] of Object.entries(bot.players)) {
    if (p && p.entity && name !== 'alpha') {
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      if (d < 25) {
        console.log(`Teammate ${name} nearby at ${lib.fmt(p.entity.position)} (dist ${d}m)`);
      }
    }
  }
}

await pickupNearby();
console.log('Alpha reached destination:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

const spawnerTarget = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawnerTarget);
bot.chat(`team: Alpha advanced to ${lib.fmt(bot.entity.position)}! Only ${dist.toFixed(1)}m from Blaze Spawner (32, 68, -190)! Holding bow & arrows for combat.`);
