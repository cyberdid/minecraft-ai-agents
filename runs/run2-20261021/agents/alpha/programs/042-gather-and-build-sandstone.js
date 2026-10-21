// programs/042-gather-and-build-sandstone.js
bot.chat("beta: Sandstone roof is brilliant! Mining sand at (5, 66, -25) to finish walls & roof.")

console.log('alpha at:', lib.fmt(bot.entity.position))

// Move to quarry
await lib.goTo(5, 66, -25, 1)
console.log('At quarry:', lib.fmt(bot.entity.position))

// Find sand blocks
const sandBlocks = lib.find('sand', { maxDistance: 12, count: 64 })
  .filter(b => b.position.x <= 7 && b.position.y >= 63)

console.log('Sand blocks to mine:', sandBlocks.length)

let mined = 0
for (const b of sandBlocks) {
  if (lib.count('sand') >= 64) break
  try {
    await lib.dig(b.position.x, b.position.y, b.position.z)
    mined++
    if (mined % 6 === 0) await lib.pickup(6)
  } catch (e) {
    console.log('dig err:', e.message)
  }
}
await lib.pickup(8)
console.log(`Mined ${mined} sand. Total in inventory:`, lib.count('sand'))

// Clear grid and stow cursor
await lib.clearCraftingGrid()
await lib.stowCursor()

// Craft sandstone in safe batches
while (lib.count('sand') >= 4) {
  const batch = Math.min(4, Math.floor(lib.count('sand') / 4))
  if (batch <= 0) break
  try {
    await lib.craft('sandstone', batch)
  } catch (e) {
    console.log('craft err:', e.message)
    await lib.clearCraftingGrid()
    break
  }
}

console.log('Sandstone count now:', lib.count('sandstone'))

// Return to house site
console.log('Returning to house site...')
await lib.goTo(10, 67, -25, 2, { dig: true })

// Get shared blueprint (sandstone walls + sandstone roof)
const blueprint = globalThis.getBlueprint(lib)
console.log('Materials needed before build:', JSON.stringify(lib.materials(blueprint).need))

// Execute build
const report = await lib.build(blueprint, { replace: true })
console.log('Build report:', JSON.stringify(report))

const mat = lib.materials(blueprint)
console.log('Materials remaining needed:', JSON.stringify(mat.need))
bot.chat(`alpha: Build updated! Placed ${report.placed} blocks. Still need: ${JSON.stringify(mat.need)}`)

return lib.status()
