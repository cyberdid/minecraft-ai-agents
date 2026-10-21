// programs/038-gather-sand.js
console.log('alpha at:', lib.fmt(bot.entity.position))

// Move to (5, 66, -25) to be clearly outside the house footprint
await lib.goTo(5, 66, -25, 1)
console.log('Now at quarry spot:', lib.fmt(bot.entity.position))

// Find sand blocks around (5, 66, -25)
const sandBlocks = lib.find('sand', { maxDistance: 10, count: 50 })
  .filter(b => b.position.x <= 7 && b.position.y >= 64)

console.log('Sand blocks found around quarry:', sandBlocks.length)

let mined = 0
for (const b of sandBlocks) {
  if (lib.count('sand') >= 60) break
  try {
    await lib.dig(b.position.x, b.position.y, b.position.z)
    mined++
    if (mined % 5 === 0) await lib.pickup(5)
  } catch (e) {
    console.log('dig err:', e.message)
  }
}
await lib.pickup(6)

console.log(`Mined ${mined} sand. Sand in inventory:`, lib.count('sand'))

// Craft all sand into sandstone
const sand = lib.count('sand')
if (sand >= 4) {
  const craftCount = Math.floor(sand / 4)
  console.log(`Crafting ${craftCount} sandstone...`)
  try {
    await lib.craft('sandstone', craftCount)
  } catch (err) {
    console.log('craft err:', err.message)
  }
}

console.log('Sandstone now:', lib.count('sandstone'))
console.log('Inventory:', JSON.stringify(lib.inv()))

return lib.status()
