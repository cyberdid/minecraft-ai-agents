// 016-more-sheep-food.js - find more sheep for wool, get dirt to 16, return towards base
console.log('Position:', lib.fmt(bot.entity.position))
console.log('Time until night:', lib.time().secondsUntilNight)

// Check for sheep
const nearestSheep = bot.nearestEntity(e => e.name === 'sheep')
if (nearestSheep && nearestSheep.position.distanceTo(bot.entity.position) < 48) {
  console.log('Found sheep at:', lib.fmt(nearestSheep.position))
  try {
    await lib.hunt('sheep', 2)
  } catch (e) {
    console.log('Sheep hunt note:', e.message)
  }
} else {
  console.log('No sheep within 48 blocks')
  // Try cows or pigs
  const cow = bot.nearestEntity(e => e.name === 'cow')
  if (cow && cow.position.distanceTo(bot.entity.position) < 32) {
    console.log('Found cow at:', lib.fmt(cow.position))
    try {
      await lib.hunt('cow', 2)
    } catch (e) {
      console.log('Cow hunt note:', e.message)
    }
  }
}

// Ensure 16 dirt
const dirtCount = lib.count('dirt')
if (dirtCount < 16) {
  console.log(`Collecting ${16 - dirtCount} dirt...`)
  try {
    await lib.collect('dirt', 16 - dirtCount)
  } catch (e) {
    console.log('Dirt collect note:', e.message)
  }
}

// Pickup drops
await lib.pickup(10)

// Return towards base
console.log('Returning towards base at (294, 72, -52)...')
try {
  await lib.goTo(294, 72, -52, 2)
  console.log('Arrived near base:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Go to base note:', e.message)
}

// Check base torches
const torches = lib.find('torch', { maxDistance: 16 })
console.log('Torches around/in base:', torches.length)

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Wool count:', lib.count('*_wool'))
console.log('Time left:', lib.time().secondsUntilNight)

return lib.inv()
