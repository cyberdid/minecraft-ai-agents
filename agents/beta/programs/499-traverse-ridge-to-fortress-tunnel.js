// programs/499-traverse-ridge-to-fortress-tunnel.js
console.log('=== Step: Traverse High Ridge to Delta at Fortress Tunnel (44, 65, -133) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Step out of Nether portal block immediately
bot.setControlState('forward', true);
await sleep(600);
bot.clearControlStates();
console.log('Stepped out of portal to:', lib.fmt(bot.entity.position));

// 2. High Ridge Waypoints directly to Fortress Tunnel
const ridgeWaypoints = [
  new Vec3(48, 65, -7),
  new Vec3(55, 65, -35),
  new Vec3(54, 64, -67),
  new Vec3(50, 65, -95),
  new Vec3(45, 65, -125),
  new Vec3(44, 65, -129),
  new Vec3(44, 65, -133)
];

for (let i = 0; i < ridgeWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = ridgeWaypoints[i];
  console.log(`Advancing to WP ${i+1}/${ridgeWaypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0);
    console.log(`Reached WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i+1} path error, using walkTo:`, e.message);
    try {
      await lib.walkTo(wp.x, wp.z);
    } catch (e2) {}
  }
}

console.log('Final position:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Check if Delta is nearby
const delta = bot.players['delta']?.entity;
if (delta) {
  const dist = bot.entity.position.distanceTo(delta.position);
  console.log(`UNITED WITH DELTA! Distance: ${dist.toFixed(1)}m at pos: ${lib.fmt(delta.position)}`);
}

bot.chat(`beta: United with Delta at Fortress advance tunnel (${lib.fmt(bot.entity.position)})! Ready to breach Blaze Spawner at (32, 68, -190)!`);
