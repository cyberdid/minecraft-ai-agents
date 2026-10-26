console.log('=== Hunting Cows for Food ===')
bot.chat('beta: Going through door to hunt cows near (305, 71, 16) for beef. Alpha please look for sheep wool!')

// 1. Go through base door
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Stepped outside. Beta at:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Door passage note:', e.message)
}

// 2. Hunt 2 cows
console.log('Hunting cows...')
const result = await lib.hunt('cow', 2)
console.log('Hunt result:', JSON.stringify(result))

console.log('Inventory now:', JSON.stringify(lib.inv()))
bot.chat(`beta: Hunted cows! Beef count: ${lib.count('beef')}.`)
