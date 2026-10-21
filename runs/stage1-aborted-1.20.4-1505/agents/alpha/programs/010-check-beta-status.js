const beta = bot.players.beta
if (beta && beta.entity) {
  console.log('beta pos:', lib.fmt(beta.entity.position))
} else {
  console.log('beta entity not visible')
}

// Check if beta placed a crafting table, furnace, or dug a staircase
const tables = bot.findBlocks({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 32 })
console.log('Crafting tables nearby:', tables.map(p => lib.fmt(p)).join(', ') || 'none')

// Check our own inventory & craft more planks/sticks/pickaxe
console.log('Alpha inventory:', JSON.stringify(lib.inv()))
console.log('Night in:', lib.time().secondsUntilNight, 's')
