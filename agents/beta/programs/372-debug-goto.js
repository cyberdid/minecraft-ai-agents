// programs/372-debug-goto.js
console.log('=== Debug bot.pathfinder.goto ===');
const m = new Movements(bot, mcData);
m.canDig = false;
m.allowParkour = true;
bot.pathfinder.setMovements(m);

const goal = new goals.GoalNear(312, 36, -41, 1);
const res = bot.pathfinder.getPathTo(m, goal, 3000);
console.log('Path status:', res.status, 'nodes length:', res.path ? res.path.length : 'null');
if (res.path && res.path.length > 0) {
  for (let i = 0; i < Math.min(res.path.length, 5); i++) {
    console.log(`Node ${i}:`, res.path[i]);
  }
}

// Try calling goto directly and catch error or resolution
try {
  console.log('Calling goto...');
  await bot.pathfinder.goto(goal);
  console.log('goto resolved!');
} catch (e) {
  console.log('goto rejected:', e.message);
}
