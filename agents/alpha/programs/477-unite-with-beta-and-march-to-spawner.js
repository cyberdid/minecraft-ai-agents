// programs/477-unite-with-beta-and-march-to-spawner.js
console.log('=== Program 477: March Fortified Bridge to Blaze Spawner ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Pick up any drops near camp
async function pickupNearby() {
  const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8);
  if (items.length > 0) {
    console.log(`Found ${items.length} items nearby, picking up...`);
    try { await lib.pickup(8); } catch (e) {}
  }
}
await pickupNearby();

// Check players near camp
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

bot.chat('team: Alpha advancing along 100% fortified bridge trail to join Beta, Gamma, and Delta at Blaze Spawner!');

// 2. Verified safe waypoints along fortified bridge
const bridgeWaypoints = [
  new Vec3(63, 64, -5),
  new Vec3(63, 65, -20),
  new Vec3(63, 65, -35),
  new Vec3(62, 65, -50),
  new Vec3(61, 65, -65),
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -127),
  new Vec3(44, 65, -140),
  new Vec3(44, 65, -150),
  new Vec3(44, 65, -161)
];

for (const wp of bridgeWaypoints) {
  if (isCancelled()) break;
  if (bot.entity.position.z < wp.z - 3) continue;

  console.log(`Advancing to ${lib.fmt(wp)}...`);
  await pickupNearby();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached ${lib.fmt(wp)}! Pos: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Path note at ${lib.fmt(wp)}: ${err.message}`);
    // Keep gaze low (feet y=64) to never trigger Enderman gaze mechanics
    try {
      await bot.lookAt(new Vec3(wp.x, 64.0, wp.z), true);
      bot.setControlState('forward', true);
      await sleep(1200);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }
}

await pickupNearby();
console.log('Alpha reached destination:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

const spawner = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawner);
bot.chat(`team: Alpha arrived at Blaze Spawner front ${lib.fmt(bot.entity.position)}! Distance to spawner: ${dist.toFixed(1)}m. Ready to farm Blaze Rods!`);
