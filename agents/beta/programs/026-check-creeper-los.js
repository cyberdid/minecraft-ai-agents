// Check creeper entity details
const c = bot.nearestEntity(e => e.name === 'creeper')
if (c) {
  console.log('Creeper pos:', c.position, 'dist:', c.position.distanceTo(bot.entity.position).toFixed(1))
  const canSee = bot.canSeeEntity(c)
  console.log('Can bot see creeper?', canSee)
} else {
  console.log('No creeper found')
}
