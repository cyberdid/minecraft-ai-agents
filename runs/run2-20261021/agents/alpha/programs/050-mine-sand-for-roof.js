// programs/050-mine-sand-for-roof.js
console.log('alpha at:', lib.fmt(bot.entity.position))

// 1. Move to quarry at (5, 66, -25)
console.log('Moving to quarry...')
await lib.goTo(5, 66, -25, 2, { dig: true })

// 2. Mine 50-60 sand
const sandBlocks = lib.find('sand', { maxDistance: 12, count: 64 })
  .filter(b => b.position.x <= 7 && b.position.y >= 63)

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
console.log(`Mined ${mined} sand. Sand in inv: ${lib.count('sand')}`)

// 3. Clear grid & craft sandstone
await lib.clearCraftingGrid()
await lib.stowCursor()

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

// 4. Return to house
await lib.goTo(10, 67, -25, 2, { dig: true })

// 5. Build
function getBlueprint () {
  return lib.shapes.house({
    x: 10, y: 67, z: -25,
    width: 5, depth: 5, height: 3,
    wall: 'sandstone',
    roof: 'sandstone',
    door: 'south',
    windows: true
  })
}

const bp = getBlueprint()
console.log('Materials needed before build:', JSON.stringify(lib.materials(bp).need))

const report = await lib.build(bp, { replace: true })
console.log('Build report:', JSON.stringify(report))

const finalMat = lib.materials(bp)
console.log('Materials remaining:', JSON.stringify(finalMat.need))

if (!finalMat.need.sandstone && !finalMat.need.oak_planks) {
  bot.chat("alpha: House at (10, 67, -25) is 100% FINISHED! 5x5 sandstone walls, roof, windows, and oak door!")
} else {
  bot.chat(`alpha: Placed ${report.placed} blocks! Remaining: ${JSON.stringify(finalMat.need)}`)
}

return lib.status()
