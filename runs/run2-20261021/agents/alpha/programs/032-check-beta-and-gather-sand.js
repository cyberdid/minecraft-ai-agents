// programs/032-check-beta-and-gather-sand.js
bot.chat("beta: Heading to base (10, 67, -25). Gathering sand and crafting sandstone for the walls!")

console.log('alpha at:', lib.fmt(bot.entity.position))

// Move to base site at (10, 67, -25)
console.log('Moving to (10, 67, -25)...')
await lib.goTo(10, 67, -25, 2, { dig: true })
console.log('Arrived at base:', lib.fmt(bot.entity.position))

// Check where beta is
const beta = bot.players.beta?.entity
console.log('Beta pos:', beta ? lib.fmt(beta.position) : 'out of range (gathering logs)')

// Find safe sand blocks to dig outside the 5x5 footprint (10..14, -25..-21)
// We'll dig in area x: 0..8, z: -25..-20
const p = bot.entity.position
const sandBlocks = lib.find('sand', { maxDistance: 24, count: 64 })
  .filter(b => b.position.y >= 65 && (b.position.x < 9 || b.position.x > 15 || b.position.z < -26 || b.position.z > -20))

console.log('Sand blocks available to dig:', sandBlocks.length)

let dug = 0
for (const b of sandBlocks) {
  if (lib.count('sand') >= 64) break
  try {
    await lib.dig(b.position.x, b.position.y, b.position.z)
    dug++
    if (dug % 6 === 0) await lib.pickup(6)
  } catch (e) {
    console.log('dig sand err:', e.message)
  }
}
await lib.pickup(8)
console.log(`Dug ${dug} sand blocks. Total sand in inventory:`, lib.count('sand'))

// Craft all sand into sandstone
const sandHave = lib.count('sand')
if (sandHave >= 4) {
  const craftCount = Math.floor(sandHave / 4)
  console.log(`Crafting ${craftCount} sandstone...`)
  try {
    await lib.craft('sandstone', craftCount)
  } catch (err) {
    console.log('craft sandstone warning:', err.message)
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
return lib.status()
