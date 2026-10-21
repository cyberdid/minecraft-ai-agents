// programs/037-gather-sand-batch1.js
console.log('alpha at:', lib.fmt(bot.entity.position))

// Find sand blocks to dig outside house site (x < 8, y >= 65)
const sandBlocks = lib.find('sand', { maxDistance: 20, count: 64 })
  .filter(b => b.position.y >= 65 && b.position.x <= 8)

console.log('Safe sand blocks to mine:', sandBlocks.length)

let mined = 0
for (const b of sandBlocks) {
  if (lib.count('sand') >= 64) break
  try {
    await lib.dig(b.position.x, b.position.y, b.position.z)
    mined++
    if (mined % 6 === 0) await lib.pickup(6)
  } catch (e) {
    console.log('dig sand err:', e.message)
  }
}
await lib.pickup(8)
console.log(`Mined ${mined} sand blocks. Total sand:`, lib.count('sand'))

// Craft sandstone (4 sand -> 1 sandstone)
const sand = lib.count('sand')
if (sand >= 4) {
  const toCraft = Math.floor(sand / 4)
  console.log(`Crafting ${toCraft} sandstone...`)
  try {
    await lib.craft('sandstone', toCraft)
  } catch (err) {
    console.log('craft sandstone err:', err.message)
  }
}

console.log('Sandstone total in inventory:', lib.count('sandstone'))
console.log('Inventory now:', JSON.stringify(lib.inv()))

return { sandstone: lib.count('sandstone'), sand: lib.count('sand') }
