console.log('Chopping 2 more logs from tree nearby...')
try {
  await lib.collect('*_log', 2)
} catch (e) {
  console.log('Chop note:', e.message)
}

console.log('Heading inside base...')
await lib.goTo(294, 72, -54, 2)
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {
  console.log('Door note:', e.message)
}

console.log('Inside base at:', bot.entity.position)
bot.chat('beta: Fuel gathered and safely inside base!')

// Craft planks from logs
const logItem = Object.keys(lib.inv()).find(k => k.endsWith('_log'))
if (logItem) {
  console.log(`Crafting planks from ${logItem}...`)
  await lib.craft('*_planks', 8)
}

// Deposit extra planks in chest for fuel
const plankItem = Object.keys(lib.inv()).find(k => k.endsWith('_planks'))
if (plankItem && lib.count(plankItem) > 4) {
  await lib.deposit({ [plankItem]: lib.count(plankItem) - 4 })
}

console.log('Beta inventory:', JSON.stringify(lib.inv()))
return lib.inv()
