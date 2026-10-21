// 003-food-and-base.js - hunt for wool & food, check base site
const time = lib.time()
console.log('Current time:', time)

// If night is close, shelter
if (time.secondsUntilNight < 60) {
  console.log('Night approaching soon, staying alert or sheltering')
}

// 1. Hunt sheep if any nearby (we need 3 white wool for a bed, 6 for two beds)
const sheep = bot.nearestEntity(e => e.name === 'sheep')
if (sheep && sheep.position.distanceTo(bot.entity.position) < 32) {
  console.log('Hunting sheep at', lib.fmt(sheep.position))
  try {
    await lib.hunt('sheep', 2)
  } catch (err) {
    console.log('Sheep hunt note:', err.message)
  }
}

// 2. Hunt cow if any nearby for food
const cow = bot.nearestEntity(e => e.name === 'cow')
if (cow && cow.position.distanceTo(bot.entity.position) < 32) {
  console.log('Hunting cow at', lib.fmt(cow.position))
  try {
    await lib.hunt('cow', 2)
  } catch (err) {
    console.log('Cow hunt note:', err.message)
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left until night:', lib.time().secondsUntilNight)
