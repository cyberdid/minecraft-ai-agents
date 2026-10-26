// programs/583-reach-spawner-bridge-and-equip-shield.js
console.log('=== Step: Advance to (37, 65, -184), Recover Shield & Fortify Spawner Bridge ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Waypoints along verified solid bridge to (37, 65, -184)
const bridgeWaypoints = [
  new Vec3(44, 65, -170),
  new Vec3(44, 65, -175),
  new Vec3(44, 65, -176),
  new Vec3(41, 65, -176),
  new Vec3(38, 65, -176),
  new Vec3(37, 65, -176),
  new Vec3(37, 65, -180),
  new Vec3(37, 65, -184)
];

bot.chat('beta: Advancing along bridgehead to Spawner bridge (37, 65, -184)!');

for (let i = 0; i < bridgeWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = bridgeWaypoints[i];
  
  // Verify floor under waypoint before stepping!
  const floorBlock = bot.blockAt(new Vec3(wp.x, 64, wp.z));
  if (!floorBlock || floorBlock.name === 'air' || floorBlock.name === 'lava') {
    console.log(`WARNING: Missing floor at (${wp.x}, 64, ${wp.z})! Stopping advance.`);
    break;
  }

  console.log(`Advancing to WP ${i+1}/${bridgeWaypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(wp.x, wp.y, wp.z));
  } catch (err) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 0.5, { dig: false }); } catch (e2) {}
  }

  await lib.pickup(6);
  await lib.equipArmor();
  await lib.equipWeapon();
}

console.log('Arrived at Spawner Bridge! Pos:', lib.fmt(bot.entity.position));
await lib.pickup(10);
await lib.equipArmor();
await lib.equipWeapon();

// If food picked up, eat to heal
if (bot.food < 18) {
  try { await lib.eat(); } catch (e) {}
}

const spawnerPos = new Vec3(32, 68, -190);
const distToSpawner = bot.entity.position.distanceTo(spawnerPos);
const shieldCount = lib.count('shield');
const cobbleCount = lib.count('cobblestone') + lib.count('netherrack') + lib.count('dirt');
const blazeRods = lib.count('blaze_rod');

console.log(`STATUS AT SPAWNER FRONT: Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health.toFixed(1)}, Shield=${shieldCount}, Cobble=${cobbleCount}, BlazeRods=${blazeRods}, DistToSpawner=${distToSpawner.toFixed(1)}m`);
const invSummary = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Inventory:', invSummary);

bot.chat(`beta: At Spawner Bridge (${lib.fmt(bot.entity.position)})! Dist: ${distToSpawner.toFixed(1)}m, Shield: ${shieldCount}, Blocks: ${cobbleCount}, Blaze Rods: ${blazeRods}. Fortifying strike slit!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  shield: shieldCount,
  blocks: cobbleCount,
  blazeRods,
  distToSpawner,
  inv: lib.inv()
};
