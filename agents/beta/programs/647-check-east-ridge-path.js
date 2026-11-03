const target = new Vec3(63, 64, -8);
console.log('Testing path to', target, 'from', bot.entity.position);

const moves = new Movements(bot, mcData);
moves.canDig = true;
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);

bot.pathfinder.setMovements(moves);
const path = bot.pathfinder.getPathTo(moves, new goals.GoalNear(target.x, target.y, target.z, 2));
console.log('Path status:', path.status, 'nodes:', path.path ? path.path.length : 0);

if (path.path && path.path.length > 0) {
  console.log('First 5 nodes:');
  for (let i = 0; i < Math.min(5, path.path.length); i++) {
    console.log(`  node ${i}: (${path.path[i].x}, ${path.path[i].y}, ${path.path[i].z})`);
  }
}
