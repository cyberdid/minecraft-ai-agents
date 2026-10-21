// 014-wait-and-hunt.js - wait for dawn tick 23460, then hunt sheep for wool and food
bot.chat('beta: Plan acknowledged! Waiting for tick 23460, then heading out to hunt sheep and food.')

while (!isCancelled()) {
  const t = lib.time()
  console.log(`Current tick: ${t.timeOfDay} (${t.phase})`)
  if (t.timeOfDay >= 23460 || t.timeOfDay < 12000) {
    console.log('Dawn has arrived!')
    break
  }
  await sleep(5000)
}

bot.chat('beta: Dawn is here! Checking hostiles and heading out to hunt sheep.')

// Check hostiles outside door
const hostiles = lib.hostiles(16)
console.log('Nearby hostiles at dawn:', JSON.stringify(hostiles))
const dangerous = hostiles.filter(h => h.name === 'creeper' && h.dist < 8)
if (dangerous.length > 0) {
  console.log('Creeper near door, waiting 8s for it to drift or burn...')
  await sleep(8000)
}

// Exit base
console.log('Exiting door at (294, 72, -54)...')
await lib.goThroughDoor(294, 72, -54)
console.log('Outside base at:', lib.fmt(bot.entity.position))

// Hunt sheep
console.log('Hunting sheep for wool...')
try {
  const rSheep = await lib.hunt('sheep', 3)
  console.log('Sheep hunt result:', JSON.stringify(rSheep))
} catch (e) {
  console.log('Sheep hunt note:', e.message)
}

// Hunt cows for food
console.log('Hunting cows for food...')
try {
  const rCow = await lib.hunt('cow', 3)
  console.log('Cow hunt result:', JSON.stringify(rCow))
} catch (e) {
  console.log('Cow hunt note:', e.message)
}

console.log('Inventory after hunt:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

// Return to base
console.log('Returning to base door...')
try {
  await lib.goTo(294, 72, -53, 1)
  await lib.goThroughDoor(294, 72, -54)
  console.log('Safely back inside base.')
} catch (e) {
  console.log('Return note:', e.message)
}

return lib.inv()
