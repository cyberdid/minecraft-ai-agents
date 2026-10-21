console.log('Starting position:', bot.entity.position)
const target = new Vec3(294, 72, -54)

const movements = new Movements(bot, mcData)
movements.canDig = false
bot.pathfinder.setMovements(movements)

try {
  await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 2))
} catch (e) {
  console.log('Pathfinder note:', e.message)
}

console.log('Arrived near base:', bot.entity.position)

// Check door
const doorBlock = bot.blockAt(new Vec3(294, 72, -54))
console.log('Door block at (294, 72, -54):', doorBlock ? doorBlock.name : 'null')
if (doorBlock && doorBlock.name.includes('door')) {
  try {
    await lib.goThroughDoor(294, 72, -54)
  } catch (e) {
    console.log('Door pass note:', e.message)
  }
}

console.log('Inside base at:', bot.entity.position)
const chest = await lib.chestContents()
console.log('Chest contents:', JSON.stringify(chest, null, 2))
