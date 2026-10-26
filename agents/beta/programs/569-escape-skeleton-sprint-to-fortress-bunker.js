// programs/569-escape-skeleton-sprint-to-fortress-bunker.js
console.log('=== Step: Escape Skeleton & Sprint to Fortress Bunker (44, 66, -127) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Helper to put out fire
async function putOutFire() {
  const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
  const fires = bot.findBlocks({ matching: fireIds, maxDistance: 3, count: 4 });
  for (const fp of fires) {
    try { await lib.dig(fp.x, fp.y, fp.z); } catch (e) {}
  }
}

// Waypoints into covered East Ridge and all the way to Fortress Bunker
const waypoints = [
  new Vec3(63, 64, -5),
  new Vec3(63, 66, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -127)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Sprinting to WP ${i+1}/${waypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);

  await putOutFire();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`WP ${i+1} path note:`, err.message);
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false });
    } catch (e2) {}
  }

  // Pick up drops along path
  await lib.pickup(6);
  await lib.equipArmor();
  await lib.equipWeapon();
}

console.log('Arrived at Fortress Bunker! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health.toFixed(1));
const invSummary = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Inventory:', invSummary);

bot.chat(`beta: Safely arrived at Fortress Bunker (${lib.fmt(bot.entity.position)})! HP: ${bot.health.toFixed(1)}, Cobblestone: ${lib.count('cobblestone')}. Ready to advance to Spawner!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
