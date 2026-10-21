// Check path to the edge
const edge = new Vec3(350, -54, -30)
const path = bot.pathfinder.getPathTo(bot.pathfinder.movements, new goals.GoalNear(edge.x, edge.y, edge.z, 3))
console.log('Path status:', path.status, 'steps:', path.path?.length)
if (path.status !== 'success') {
  console.log('Path could not be found! Let us check what is below our feet:')
  const p = bot.entity.position.floored()
  for (let dy = 0; dy >= -10; dy--) {
    const b = bot.blockAt(p.offset(0, dy, 0))
    console.log(`Block at y=${p.y + dy}:`, b?.name)
  }
}
return { status: path.status, steps: path.path?.length }
