// programs/418-walk-to-portal.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
await sleep(250);

console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Walk toward portal in stages if needed:
// Delta is around x=245, portal is at x=299, z=-54, y=73.
const waypoints = [
  { x: 260, y: 65, z: -53 },
  { x: 275, y: 68, z: -53 },
  { x: 290, y: 72, z: -53 },
  { x: 298, y: 72, z: -52 }
];

for (const wp of waypoints) {
  if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3) continue;
  console.log(`Walking to waypoint (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 25000 });
    console.log(`Reached (${wp.x}, ${wp.y}, ${wp.z})! Current pos:`, lib.fmt(bot.entity.position));
  } catch (e) {
    console.log(`Failed reaching (${wp.x}, ${wp.y}, ${wp.z}):`, e.message);
    // Try XZ
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 15000 });
      console.log(`Reached XZ (${wp.x}, ${wp.z})! Current pos:`, lib.fmt(bot.entity.position));
    } catch (e2) {
      console.log(`Failed reaching XZ (${wp.x}, ${wp.z}):`, e2.message);
    }
  }
}

console.log('Final pos before portal:', lib.fmt(bot.entity.position));
// Now enter portal!
if (bot.entity.position.distanceTo(new Vec3(299, 72, -54)) < 8) {
  console.log('Entering Nether Portal now...');
  const res = await enterNetherPortal();
  console.log('Portal warp result:', JSON.stringify(res));
}
