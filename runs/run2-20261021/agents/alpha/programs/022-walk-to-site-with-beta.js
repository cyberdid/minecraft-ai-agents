// programs/022-walk-to-site-with-beta.js
bot.chat("beta: Walking with you to (10, 67, -25)! Toss me tools/blocks, let's build the house.")

console.log('Walking to house site (10, 67, -25)...')
await lib.goTo(10, 67, -25, 1, { dig: true })
console.log('Arrived at site:', lib.fmt(bot.entity.position))

// Check for dropped items nearby (in case beta tosses tools)
await lib.pickup(6)

// Check beta position
const beta = bot.players.beta?.entity
console.log('beta pos:', beta ? lib.fmt(beta.position) : 'not nearby')

console.log('Inventory:', JSON.stringify(lib.inv()))
return lib.status()
