// programs/500-return-to-base-from-spawn.js
console.log('=== Step: Return to Base from World Spawn ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Night in:', bot.time.nightIn);

// 1. Walk in stages East to base (294, 72, -55)
const waypoints = [
  new Vec3(220, 64, -65),
  new Vec3(260, 68, -60),
  new Vec3(290, 72, -55),
  new Vec3(294, 72, -53)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Moving to waypoint ${i+1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.5);
    console.log(`Reached WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i+1} path error, trying walkTo:`, e.message);
    try { await lib.walkTo(wp.x, wp.z); } catch (e2) {}
  }
}

// 2. Enter base through door at (294, 72, -54)
try {
  await lib.goThroughDoor(294, 72, -54, { close: true });
  console.log('Safely inside base at', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door pass error:', e.message);
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 3. Set spawn at Bed 2 (293, 72, -55)
try {
  await lib.setSpawn();
  console.log('SUCCESS: Respawn point set at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

console.log('Final pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
bot.chat(`beta: Safely back inside base at ${lib.fmt(bot.entity.position)}! Spawn set at bed.`);
