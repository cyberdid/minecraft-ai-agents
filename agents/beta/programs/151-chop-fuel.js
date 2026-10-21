console.log('Stepping outside to chop 6 logs for furnace fuel...')
bot.chat('beta: Chopping a quick tree for furnace fuel!')

try {
  await lib.door(294, 72, -54, true)
} catch (e) {}

const gained = await lib.collect('*_log', 6)
console.log('Gained logs:', gained)

console.log('Returning inside base...')
await lib.goTo(294, 72, -54, 1)
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {}

// Craft 16 planks from logs
const logItem = Object.keys(lib.inv()).find(k => k.endsWith('_log'))
if (logItem) {
  console.log(`Crafting planks from ${logItem}...`)
  await lib.craft('*_planks', 16)
}

// Deposit extra planks in chest for fuel
const plankItem = Object.keys(lib.inv()).find(k => k.endsWith('_planks'))
if (plankItem && lib.count(plankItem) > 8) {
  await lib.deposit({ [plankItem]: lib.count(plankItem) - 8 })
}

bot.chat('beta: Planks ready for fuel in furnace!')
console.log('Inventory now:', JSON.stringify(lib.inv()))
return lib.inv()
