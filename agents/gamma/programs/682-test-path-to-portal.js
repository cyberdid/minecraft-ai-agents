// programs/682-test-path-to-portal.js
globalThis.configureFireAvoidance();
const target = new Vec3(41, 65, -7);
console.log('Finding path to portal:', lib.fmt(target));
const p = bot.pathfinder.getPathTo(bot.pathfinder.movements, new goals.GoalNear(target.x, target.y, target.z, 0.5));
console.log('Path status:', p.status, 'nodes:', p.path?.length);
if (p.path) {
  for (const n of p.path) {
    console.log(`Node: (${n.x}, ${n.y}, ${n.z})`);
  }
}
