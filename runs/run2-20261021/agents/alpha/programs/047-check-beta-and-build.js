// programs/047-check-beta-and-build.js
console.log('alpha at:', lib.fmt(bot.entity.position))

// 1. Clear grid and stow cursor
await lib.clearCraftingGrid()
await lib.stowCursor()

// 2. Craft sandstone from current sand (28 sand -> 7 sandstone)
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

// 3. Move to house site (10, 67, -25)
console.log('Going to house at (10, 67, -25)...')
await lib.goTo(10, 67, -25, 2, { dig: true })
console.log('At house:', lib.fmt(bot.entity.position))

// Check beta
const beta = bot.players.beta?.entity
if (beta) {
  console.log('Beta pos:', lib.fmt(beta.position))
}

// 4. Check blueprint materials needed
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
const matBefore = lib.materials(bp)
console.log('Blueprint materials needed before build:', JSON.stringify(matBefore.need))

// 5. Run build if we have sandstone
if (lib.count('sandstone') > 0) {
  const report = await lib.build(bp, { replace: true })
  console.log('Build report:', JSON.stringify(report))
}

const matAfter = lib.materials(bp)
console.log('Blueprint materials remaining:', JSON.stringify(matAfter.need))

if (!matAfter.need.sandstone && !matAfter.need.oak_planks) {
  bot.chat("alpha: House at (10, 67, -25) is 100% FINISHED! 5x5 sandstone walls, roof, windows, and oak door!")
} else {
  bot.chat(`alpha: House progress updated! Remaining blocks needed: ${JSON.stringify(matAfter.need)}`)
}

return lib.status()
