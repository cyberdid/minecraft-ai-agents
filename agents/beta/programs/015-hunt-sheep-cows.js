// 015-hunt-sheep-cows.js - hunt sheep for wool and cows for meat
bot.chat('beta: Heading out towards (315, 73, -30) to hunt sheep and cows.')

// Close door if open and clear
try {
  await lib.door(294, 72, -54, false)
} catch (e) {
  console.log('Door close note:', e.message)
}

console.log('Hunting sheep...')
try {
  const gotSheep = await lib.hunt('sheep', 4)
  console.log('Sheep hunt result:', JSON.stringify(gotSheep))
} catch (e) {
  console.log('Sheep hunt error/note:', e.message)
}

console.log('Hunting cows...')
try {
  const gotCows = await lib.hunt('cow', 4)
  console.log('Cow hunt result:', JSON.stringify(gotCows))
} catch (e) {
  console.log('Cow hunt error/note:', e.message)
}

// Pickup nearby drops
await lib.pickup(12)

console.log('Inventory now:', JSON.stringify(lib.inv()))
const t = lib.time()
console.log('Time left in day:', t.secondsUntilNight)

// Check wool count
const wool = lib.count('*_wool')
console.log('Total wool:', wool)

bot.chat(`beta: Hunt completed. Wool count: ${wool}. Returning near base.`)

// Head back near base
try {
  await lib.goTo(294, 72, -52, 2)
} catch (e) {
  console.log('Go to base note:', e.message)
}

return lib.inv()
