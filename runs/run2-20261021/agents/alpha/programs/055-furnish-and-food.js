// programs/055-furnish-and-food.js
// Describe finished structure in chat and coordinate interior improvements
bot.chat("alpha: Structure verified complete at (10, 67, -25)! 5x5 sandstone walls, full solid roof, window openings, and oak door at (12, 67, -21). Starting interior improvements!")

console.log('alpha at:', lib.fmt(bot.entity.position))

// Check if crafting table or furnace is nearby
const table = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 16 })
console.log('Crafting table nearby:', table ? lib.fmt(table.position) : 'none')

// Check inside house coordinates: (11..13, 67, -24..-22)
console.log('Inspecting inside corner (11, 67, -24)...')
const insideCorner = bot.blockAt(new Vec3(11, 67, -24))
console.log('Inside corner block:', insideCorner?.name)

// Check food / animals nearby for restoration
const animals = Object.values(bot.entities)
  .filter(e => ['rabbit', 'cow', 'pig', 'sheep', 'chicken'].includes(e.name) && e.position.distanceTo(bot.entity.position) <= 32)
console.log(`Passive animals within 32m: ${animals.length}`)
for (const a of animals.slice(0, 3)) {
  console.log(`- ${a.name} at ${lib.fmt(a.position)} dist: ${Math.round(a.position.distanceTo(bot.entity.position))}`)
}

const beta = bot.players.beta?.entity
console.log('Beta pos:', beta ? lib.fmt(beta.position) : 'unknown')

return { table: !!table, animals: animals.length }
