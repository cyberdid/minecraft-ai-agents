// programs/352-test-path.js
console.log('=== Test path to (303, 33, -43) ===');
const m = new Movements(bot, mcData);
m.canDig = false;
m.allowParkour = true;
m.allow1by1towers = false;
bot.pathfinder.setMovements(m);

const path = bot.pathfinder.getPathTo(m, new goals.GoalNear(303, 33, -43, 1), 3000);
console.log('Path status:', path.status, 'nodes:', path.path ? path.path.length : 0);
if (path.path) {
  for (let i = 0; i < Math.min(path.path.length, 10); i++) {
    const n = path.path[i];
    console.log(`  node ${i}: (${n.x}, ${n.y}, ${n.z})`);
  }
}
