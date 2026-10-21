// programs/025-go-to-beta-shelter.js
bot.chat("beta: Night in 60s! Sheltering with you.")

console.log('Going to beta at (32, 64, -47)...')
try {
  await lib.goTo(32, 64, -47, 2, { dig: true })
} catch (e) {
  console.log('goTo failed:', e.message)
}

const beta = bot.players.beta?.entity
console.log('Beta pos:', beta ? lib.fmt(beta.position) : 'unknown')

// Check if there are placed blocks, doors, tables around beta
const blocksAround = []
const bp = bot.entity.position
for (let dx = -3; dx <= 3; dx++) {
  for (let dy = -1; dy <= 3; dy++) {
    for (let dz = -3; dz <= 3; dz++) {
      const b = bot.blockAt(bp.offset(dx, dy, dz))
      if (b && !['air', 'sand', 'sandstone', 'water'].includes(b.name)) {
        blocksAround.push(`${b.name} at ${lib.fmt(b.position)}`)
      }
    }
  }
}
console.log('Special blocks around us:', blocksAround.join(', '))

// Also pickup anything dropped
const picked = await lib.pickup(6)
console.log('Picked up:', picked, 'Inventory now:', JSON.stringify(lib.inv()))

return lib.status()
