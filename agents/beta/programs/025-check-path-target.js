// Check pathfinder to (350, -54, -30)
const target = new Vec3(350, -54, -30)
const path = bot.pathfinder.getPathTo(bot.pathfinder.movements, new goals.GoalNear(target.x, target.y, target.z, 1))
console.log('Path status:', path.status, 'steps:', path.path?.length)
if (path.path && path.path.length > 0) {
  for (let s of path.path) {
    console.log('  ->', s.x, s.y, s.z)
  }
}
return { status: path.status, steps: path.path?.length }
