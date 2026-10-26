// programs/513-advance-to-spawner-frontline.js
console.log('=== Program 513: Advance to Spawner Frontline ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Cobble in inv:', lib.count('cobblestone'));

bot.pathfinder.stop();
await sleep(100);

await lib.equipWeapon();

// Safe waypoints along the ridge tunnel into the fortress
const waypoints = [
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -159) // Station safely behind Delta's baffle wall
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  // Keep pitch low (y=64) to never trigger Enderman gaze mechanics
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`WP note to ${lib.fmt(wp)}: ${e.message}`);
    await bot.lookAt(new Vec3(wp.x + 0.5, 64.0, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
  }
}

console.log('Current pos after march:', lib.fmt(bot.entity.position));
bot.chat(`alpha: Arrived at frontline ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & stone swords!`);

// Scan nearby teammates and hostiles
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

const hostiles = lib.hostiles(32);
console.log(`Found ${hostiles.length} hostiles within 32m:`);
for (const h of hostiles) {
  console.log(`  ${h.name} at ${lib.fmt(h.pos)} (dist ${h.dist.toFixed(1)}m)`);
}

// Check blocks at z=-160
console.log('Baffle blocks at z=-160:');
console.log('  (44, 65, -160):', bot.blockAt(new Vec3(44, 65, -160))?.name);
console.log('  (44, 66, -160):', bot.blockAt(new Vec3(44, 66, -160))?.name);

// Check Spawner at (32, 68, -190)
const spawnerPos = new Vec3(32, 68, -190);
const distToSpawner = bot.entity.position.distanceTo(spawnerPos);
console.log(`Distance to Blaze Spawner: ${distToSpawner.toFixed(1)}m`);

console.log('Final inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
