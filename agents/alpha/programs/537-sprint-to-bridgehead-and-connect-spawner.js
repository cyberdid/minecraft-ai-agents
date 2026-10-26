// programs/537-sprint-to-bridgehead-and-connect-spawner.js
console.log('=== Program 537: Sprint to Bridgehead & Connect Spawner ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

bot.pathfinder.stop();
await sleep(100);

await lib.equipWeapon();

// 1. Sprint along safe covered East Ridge waypoints to bridgehead at (44, 65, -174)
const waypoints = [
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -165),
  new Vec3(44, 65, -174)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  // Pitch down to y=64 to never aggro Endermen
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

console.log('Arrived at bridgehead:', lib.fmt(bot.entity.position));
bot.chat(`alpha: At Spawner bridgehead ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & stone swords! Connecting to Balcony!`);

// 2. Helper to safely place block
async function placeBlock(name, x, y, z) {
  const b = bot.blockAt(new Vec3(x, y, z));
  if (b && b.name !== 'air' && b.name !== 'cave_air') return true;
  try {
    await lib.place(name, x, y, z);
    console.log(`Placed ${name} at (${x}, ${y}, ${z})`);
    return true;
  } catch (e) {
    console.log(`Place (${x}, ${y}, ${z}) note: ${e.message}`);
    return false;
  }
}

// 3. Connect bridge to balcony at (34, 67, -188) with strict bottom-up checks
const bridgeSteps = [
  { x: 43, y: 64, z: -176 },
  { x: 42, y: 65, z: -177 },
  { x: 41, y: 65, z: -178 },
  { x: 40, y: 65, z: -179 },
  { x: 39, y: 66, z: -181 },
  { x: 38, y: 66, z: -183 },
  { x: 37, y: 66, z: -185 },
  { x: 36, y: 67, z: -186 },
  { x: 35, y: 67, z: -187 },
  { x: 34, y: 67, z: -188 }
];

console.log('Building bridge floor to Spawner Balcony...');
for (let i = 0; i < bridgeSteps.length; i++) {
  const step = bridgeSteps[i];
  const mat = lib.count('cobblestone') > 2 ? 'cobblestone' : (lib.count('dirt') > 0 ? 'dirt' : 'birch_planks');
  if (!mat) break;
  
  // Place floor block
  await placeBlock(mat, step.x, step.y, step.z);
  
  // Only step forward if the floor block actually exists and is solid!
  const floorCheck = bot.blockAt(new Vec3(step.x, step.y, step.z));
  if (floorCheck && floorCheck.boundingBox === 'block') {
    const d = bot.entity.position.distanceTo(new Vec3(step.x, step.y + 1, step.z));
    if (d > 1.2 && d < 3.5) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(step.x, step.y + 1, step.z, 1));
      } catch (err) {}
    }
  }
}

console.log('Position after bridge extension:', lib.fmt(bot.entity.position));
const spawnerPos = new Vec3(32, 68, -190);
const distToSpawner = bot.entity.position.distanceTo(spawnerPos);
console.log(`Distance to Blaze Spawner: ${distToSpawner.toFixed(1)}m`);
bot.chat(`alpha: Frontline bridge extended! Distance to Spawner: ${distToSpawner.toFixed(1)}m!`);

// 4. Check for Blazes and strike through slit
const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze' && e.isValid);
console.log(`Found ${blazes.length} blazes nearby:`);
for (const b of blazes) {
  const d = bot.entity.position.distanceTo(b.position);
  console.log(`  Blaze at ${lib.fmt(b.position)} (dist ${d.toFixed(1)}m)`);
  if (d <= 4.0) {
    console.log('Striking Blaze with stone sword!');
    await bot.lookAt(b.position.offset(0, b.height * 0.5, 0), true);
    bot.attack(b);
    await sleep(600);
  }
}

// 5. Pick up any dropped items
await lib.pickup(6);
console.log('Blaze rods in inv:', lib.count('blaze_rod'));
console.log('Final inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
