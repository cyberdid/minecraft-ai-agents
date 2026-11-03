console.log('=== Program 907: Inspect Bunker Exit to Portal (46, 66, 2) ===');
console.log('Beta pos:', lib.fmt(bot.entity.position));

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
moves.canPlaceOn = true;

const target = new Vec3(46.5, 66.0, 2.0);
const path = bot.pathfinder.getPathTo(moves, new goals.GoalNear(target.x, target.y, target.z, 0.5));

console.log('Path status:', path.status, 'nodes:', path.path ? path.path.length : 0);
if (path.path && path.path.length > 0) {
  for (let i = 0; i < Math.min(8, path.path.length); i++) {
    console.log(`  node ${i}: ${lib.fmt(path.path[i])}`);
  }
}
