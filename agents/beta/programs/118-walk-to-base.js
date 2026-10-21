console.log('Resetting pathfinder goal...')
bot.pathfinder.setGoal(null)
await sleep(200)

const movements = new Movements(bot, mcData)
movements.canDig = false
bot.pathfinder.setMovements(movements)

console.log('Walking to base from', bot.entity.position)
await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 2))
console.log('Arrived near base at:', bot.entity.position)

// Door at (294, 72, -54)
const door = bot.blockAt(new Vec3(294, 72, -54))
console.log('Door block:', door ? door.name : 'null')
if (door && door.name.includes('door')) {
  await lib.goThroughDoor(294, 72, -54)
}

console.log('Inside base at:', bot.entity.position)
const chest = await lib.chestContents()
console.log('Chest contents:', JSON.stringify(chest, null, 2))
