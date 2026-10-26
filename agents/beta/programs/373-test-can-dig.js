// programs/373-test-can-dig.js
console.log('=== Test getPathTo with canDig = true ===');
const m = new Movements(bot, mcData);
m.canDig = true;
m.allowParkour = true;
m.allow1by1towers = false;
bot.pathfinder.setMovements(m);

const goal = new goals.GoalNear(312, 36, -41, 1);
const res = bot.pathfinder.getPathTo(m, goal, 3000);
console.log('Path status:', res.status, 'nodes length:', res.path ? res.path.length : 'null');
if (res.path && res.path.length > 0) {
  for (let i = 0; i < Math.min(res.path.length, 5); i++) {
    const n = res.path[i];
    console.log(`Node ${i}: (${n.x}, ${n.y}, ${n.z})`);
  }
}
