const movements = new Movements(bot, mcData)
movements.canDig = false
movements.canTower = true
const path = bot.pathfinder.getPathTo(movements, new goals.GoalNear(350, 65, -30, 1))
console.log('Path status:', path.status)
console.log('Path length:', path.path ? path.path.length : 0)
if (path.path) {
  for (const p of path.path) {
    console.log(`-> (${p.x}, ${p.y}, ${p.z})`)
  }
}
