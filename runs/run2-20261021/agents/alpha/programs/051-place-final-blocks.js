// programs/051-place-final-blocks.js
console.log('alpha at:', lib.fmt(bot.entity.position))

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

// Execute build with our 8 sandstone
const report = await lib.build(bp, { replace: true })
console.log('Build report:', JSON.stringify(report))

const matAfter = lib.materials(bp)
console.log('Materials status after build:', JSON.stringify(matAfter.need))

if (!matAfter.need.sandstone && !matAfter.need.oak_planks) {
  bot.chat("alpha: House at (10, 67, -25) is 100% COMPLETE! 5x5 sandstone walls, roof, windows, and door!")
} else {
  bot.chat(`alpha: Placed ${report.placed} blocks! Only ${JSON.stringify(matAfter.need)} remaining!`)
}

return lib.status()
