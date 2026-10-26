// programs/565-sprint-nether-ridge-to-spawner-front.js
console.log('=== Step: Sprint Nether East Ridge to Spawner Front (44, 64, -172) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

if (!bot.game.dimension.includes('nether')) {
  throw new Error('Not in the Nether! Current dimension: ' + bot.game.dimension);
}

// 1. Step East out of bunker
console.log('Exiting bunker East to (46, 65, -7)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 1));
} catch (e) {
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.clearControlStates();
}

// 2. Mine 8-12 netherrack for cover
console.log('Mining netherrack for construction/cover...');
for (let d = 0; d < 8; d++) {
  if (lib.count('netherrack') >= 12) break;
  const nr = bot.findBlock({
    matching: mcData.blocksByName.netherrack.id,
    maxDistance: 4
  });
  if (nr) {
    try {
      await lib.dig(nr.position.x, nr.position.y, nr.position.z);
      await lib.pickup(3);
    } catch (e) {}
  } else {
    break;
  }
}
console.log('Netherrack count:', lib.count('netherrack'), 'Total inv:', JSON.stringify(lib.inv()));

// 3. Safe East Ridge Waypoints
const ridgeWaypoints = [
  new Vec3(63, 64, -5),
  new Vec3(63, 66, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -127),
  new Vec3(44, 65, -141),
  new Vec3(44, 65, -149),
  new Vec3(44, 64, -165),
  new Vec3(44, 64, -172)
];

bot.chat('beta: Marching through covered East Ridge to join Alpha & Delta at Spawner Front (44, 64, -172)!');

for (let i = 0; i < ridgeWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = ridgeWaypoints[i];
  console.log(`Advancing to WP ${i+1}/${ridgeWaypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);

  // Extinguish fire near path
  const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
  const fires = bot.findBlocks({ matching: fireIds, maxDistance: 3, count: 4 });
  for (const fp of fires) {
    try { await lib.dig(fp.x, fp.y, fp.z); } catch (e) {}
  }

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`WP ${i+1} path note:`, err.message);
    try { await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false }); } catch (e2) {}
  }

  // Pick up any dropped tools/armor along hallway
  if (wp.z <= -127) {
    await lib.pickup(8);
    await lib.equipArmor();
    await lib.equipWeapon();
  }
}

// 4. Arrived at Spawner Front (44, 64, -172)
console.log('Arrived at Spawner Front! Pos:', lib.fmt(bot.entity.position));
await lib.pickup(10);
await lib.equipArmor();
await lib.equipWeapon();

const spawnerPos = new Vec3(32, 68, -190);
const distToSpawner = bot.entity.position.distanceTo(spawnerPos);
const blazeRods = bot.inventory.count(mcData.itemsByName.blaze_rod?.id || 0);
const invSummary = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');

console.log(`STATUS: Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health.toFixed(1)}, DistToSpawner=${distToSpawner.toFixed(1)}m, BlazeRods=${blazeRods}`);
console.log(`Inventory: ${invSummary || 'empty'}`);

bot.chat(`beta: At Spawner Front (${lib.fmt(bot.entity.position)})! Dist: ${distToSpawner.toFixed(1)}m, Blaze Rods: ${blazeRods}. Team united!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  distToSpawner,
  blazeRods,
  inv: lib.inv()
};
