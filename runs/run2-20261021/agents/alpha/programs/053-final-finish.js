// programs/053-final-finish.js
console.log('alpha at:', lib.fmt(bot.entity.position))

// 1. Mine 8 sand right nearby to craft 2 sandstone
const sandNearby = lib.find('sand', { maxDistance: 12, count: 10 })
  .filter(b => b.position.x <= 9 || b.position.x >= 15 || b.position.z >= -19)

for (const b of sandNearby) {
  if (lib.count('sand') >= 8) break
  try {
    await lib.dig(b.position.x, b.position.y, b.position.z)
    await lib.pickup(4)
  } catch (e) {
    console.log('dig err:', e.message)
  }
}
await lib.pickup(6)
console.log('Sand in inventory:', lib.count('sand'))

// 2. Craft sandstone
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
console.log('Sandstone in inventory:', lib.count('sandstone'))

// 3. Build blueprint
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
console.log('Materials status before build:', JSON.stringify(lib.materials(bp).need))

const report = await lib.build(bp, { replace: true })
console.log('Build report:', JSON.stringify(report))

const finalMat = lib.materials(bp)
console.log('Materials remaining:', JSON.stringify(finalMat.need))

if (Object.keys(finalMat.need).length === 0) {
  bot.chat("alpha: The 5x5 sandstone house at (10, 67, -25) is 100% COMPLETE! It features 4 solid sandstone walls, full sandstone roof, windows, and an oak entrance door at (12, 67, -21).")
} else {
  bot.chat(`alpha: Placed ${report.placed} blocks! Remaining: ${JSON.stringify(finalMat.need)}`)
}

return lib.status()
