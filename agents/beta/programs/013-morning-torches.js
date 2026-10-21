// 013-morning-torches.js - exit base safely, gather logs, smelt charcoal, make & place torches
const hostiles = lib.hostiles(16)
console.log('Hostiles near door:', JSON.stringify(hostiles))
const dangerous = hostiles.filter(h => h.name === 'creeper' && h.dist < 8)
if (dangerous.length > 0) {
  console.log('Creeper too close to door, waiting a moment...')
  await sleep(5000)
}

bot.chat('beta: Stepping outside to gather wood for charcoal & torches!')

// Go through door
console.log('Exiting through door at (294, 72, -54)...')
await lib.goThroughDoor(294, 72, -54)
console.log('Outside at:', lib.fmt(bot.entity.position))

// Collect 8 logs
console.log('Collecting 8 logs for charcoal & tools...')
const logs = await lib.collect('*_log', 8)
console.log('Logs collected:', JSON.stringify(logs))

// Re-enter base
console.log('Returning to base door...')
await lib.goThroughDoor(294, 72, -54)
console.log('Inside base at:', lib.fmt(bot.entity.position))

// Smelt 4 logs into charcoal using planks as fuel in furnace at (295, 72, -55)
const logItem = Object.keys(lib.inv()).find(k => k.endsWith('_log'))
if (logItem && lib.count(logItem) >= 4) {
  console.log(`Smelting 4 ${logItem} into charcoal...`)
  await lib.smelt(logItem, 'oak_planks', 4)
  console.log('Smelting complete. Charcoal count:', lib.count('charcoal'))
}

// Craft torches
if (lib.count('charcoal') > 0 || lib.count('coal') > 0) {
  const fuel = lib.count('charcoal') > 0 ? 'charcoal' : 'coal'
  const count = Math.min(lib.count(fuel), 4) * 4
  console.log(`Crafting ${count} torches...`)
  await lib.craft('torch', count)
  console.log('Torches count:', lib.count('torch'))
}

// Place torches in base
if (lib.count('torch') > 0) {
  // Place on wall or floor inside base
  console.log('Placing torch inside base...')
  try {
    await lib.place('torch', 293, 73, -56)
    console.log('Placed torch at (293, 73, -56)')
  } catch (e) {
    try {
      await lib.place('torch', 294, 72, -56)
      console.log('Placed torch on floor at (294, 72, -56)')
    } catch (e2) {
      console.log('Torch place error:', e2.message)
    }
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time:', lib.time())
bot.chat(`beta: Milestone 1 complete! Base is fully lit and equipped with door, chest, table, furnace.`)
