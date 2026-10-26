// programs/494-sprint-tunnel-and-recover-gear.js
console.log('=== Program 494: Sprint Covered Tunnel & Recover Gear ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Helper to pick up nearby items
async function pickupNearby() {
  const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8);
  if (items.length > 0) {
    try { await lib.pickup(8); } catch (e) {}
  }
}

bot.chat('team: Alpha sprinting through 100% covered tunnel to recover gear and join spawner assault!');

// Verified safe waypoints along 100% covered ridge tunnel
const waypoints = [
  new Vec3(63, 64, -5),
  new Vec3(63, 65, -20),
  new Vec3(63, 65, -35),
  new Vec3(62, 65, -50),
  new Vec3(61, 65, -65),
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -127),
  new Vec3(44, 65, -140),
  new Vec3(44, 65, -150),
  new Vec3(44, 65, -163),
  new Vec3(44, 65, -174)
];

for (const wp of waypoints) {
  if (isCancelled()) break;
  if (bot.entity.position.z < wp.z - 3) continue;

  console.log(`Advancing to ${lib.fmt(wp)}...`);
  await pickupNearby();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (err) {
    // Direct movement fallback
    try {
      await bot.lookAt(new Vec3(wp.x, 64.0, wp.z), true);
      bot.setControlState('forward', true);
      await sleep(1000);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }
}

await pickupNearby();
await lib.equipWeapon();
await lib.equipArmor();

console.log('Alpha arrived at front:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

const spawner = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawner);

bot.chat(`team: Alpha at spawner front ${lib.fmt(bot.entity.position)}! Dist: ${dist.toFixed(1)}m. Tools: ${JSON.stringify(lib.tools())}, Cobble: ${lib.count('cobblestone')}. Ready to farm Blazes!`);
