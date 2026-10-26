// programs/548-sprint-tunnel-and-breach-spawner.js
console.log('=== Program 548: Sprint Covered Tunnel & Breach Spawner ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Cobble in inv:', lib.count('cobblestone'));

bot.pathfinder.stop();
await sleep(100);

await lib.equipWeapon();

// Configure pathfinder fire avoidance
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
bot.pathfinder.setMovements(moves);

// 1. Sprint along the 100% enclosed tunnel waypoints to Spawner Bridgehead at (44, 65, -174)
const tunnelWaypoints = [
  new Vec3(63, 65, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -165),
  new Vec3(44, 65, -174) // Spawner Bridgehead
];

for (let i = 0; i < tunnelWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = tunnelWaypoints[i];
  console.log(`Advancing to WP ${i + 1}/${tunnelWaypoints.length}: ${lib.fmt(wp)}...`);
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

console.log('Arrived at Spawner Bridgehead! Pos:', lib.fmt(bot.entity.position));
bot.chat(`alpha: Reached Spawner Bridgehead ${lib.fmt(bot.entity.position)} with stone swords & ${lib.count('cobblestone')} cobble! Bridging to Spawner Balcony!`);

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

// 3. Connect diagonal bridge to Spawner Balcony platform at (34, 67, -188)
// Step-by-step with strict verification of solid floor underfoot before advancing
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
  { x: 34, y: 67, z: -188 } // Balcony platform!
];

console.log('Extending bridge to Spawner Balcony...');
for (let i = 0; i < bridgeSteps.length; i++) {
  const step = bridgeSteps[i];
  const mat = lib.count('cobblestone') > 2 ? 'cobblestone' : (lib.count('dirt') > 0 ? 'dirt' : 'birch_planks');
  if (!mat) break;
  
  await placeBlock(mat, step.x, step.y, step.z);
  
  // Verify solid floor before taking step
  const check = bot.blockAt(new Vec3(step.x, step.y, step.z));
  if (check && check.boundingBox === 'block') {
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
bot.chat(`alpha: Bridge connected! Distance to Blaze Spawner: ${distToSpawner.toFixed(1)}m! Breaching!`);

// 4. Scan for Blazes and strike through slit
await lib.equipWeapon();
for (let r = 0; r < 10; r++) {
  if (isCancelled()) break;
  const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze' && e.isValid);
  if (blazes.length > 0) {
    const target = blazes[0];
    const d = bot.entity.position.distanceTo(target.position);
    console.log(`Targeting Blaze at ${lib.fmt(target.position)} (dist ${d.toFixed(1)}m)...`);
    if (d <= 4.5) {
      await bot.lookAt(target.position.offset(0, target.height * 0.5, 0), true);
      bot.attack(target);
      await sleep(600);
    }
  } else {
    await sleep(1000);
  }
  await lib.pickup(6);
  if (lib.count('blaze_rod') > 0) {
    console.log(`BLAZE ROD HARVESTED! Count: ${lib.count('blaze_rod')}!`);
    bot.chat(`alpha: BLAZE ROD HARVESTED! Total: ${lib.count('blaze_rod')}! Milestone 8 underway!`);
    break;
  }
}

console.log('=== Final Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Blaze rods:', lib.count('blaze_rod'));
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
