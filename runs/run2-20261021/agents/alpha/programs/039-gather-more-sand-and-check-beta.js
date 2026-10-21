// programs/039-gather-more-sand-and-check-beta.js
console.log('alpha at:', lib.fmt(bot.entity.position))

// Check beta
const beta = bot.players.beta?.entity
console.log('Beta pos:', beta ? lib.fmt(beta.position) : 'out of range')

// Clear crafting grid just in case
await lib.clearCraftingGrid()

// Craft sandstone from remaining sand
let sand = lib.count('sand')
if (sand >= 4) {
  const toCraft = Math.floor(sand / 4)
  console.log(`Crafting ${toCraft} sandstone from ${sand} sand...`)
  try {
    await lib.craft('sandstone', toCraft)
  } catch (e) {
    console.log('craft sandstone warning:', e.message)
  }
}
console.log('Sandstone count now:', lib.count('sandstone'))

// Mine another 50-60 sand around (5, 64, -25)
const sandBlocks = lib.find('sand', { maxDistance: 12, count: 64 })
  .filter(b => b.position.x <= 7 && b.position.y >= 62)

console.log('Sand blocks available:', sandBlocks.length)
let mined = 0
for (const b of sandBlocks) {
  if (lib.count('sand') >= 60) break
  try {
    await lib.dig(b.position.x, b.position.y, b.position.z)
    mined++
    if (mined % 6 === 0) await lib.pickup(6)
  } catch (e) {
    console.log('dig err:', e.message)
  }
}
await lib.pickup(8)
console.log(`Mined ${mined} more sand. Sand total:`, lib.count('sand'))

// Craft all sand into sandstone
sand = lib.count('sand')
if (sand >= 4) {
  const toCraft = Math.floor(sand / 4)
  console.log(`Crafting ${toCraft} sandstone from new sand...`)
  try {
    await lib.craft('sandstone', toCraft)
  } catch (e) {
    console.log('craft warning:', e.message)
  }
}

console.log('TOTAL Sandstone in inventory:', lib.count('sandstone'))
bot.chat(`alpha: Have ${lib.count('sandstone')} sandstone for walls! Heading to site.`)

return lib.status()
