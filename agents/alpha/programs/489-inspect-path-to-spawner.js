// programs/489-inspect-path-to-spawner.js
console.log('=== Program 489: Inspect Full Path to Spawner ===');
const goal = new goals.GoalNear(32, 68, -190, 2);
const path = bot.pathfinder.getPathTo(bot.pathfinder.movements, goal);
console.log(`Path status: ${path.status}, cost: ${path.cost.toFixed(1)}, steps: ${path.path.length}`);

for (let i = 0; i < path.path.length; i++) {
  const p = path.path[i];
  console.log(`Step ${i}: (${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)})`);
}
