// programs/043-finish-walls.js
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
globalThis.getBlueprint = getBlueprint

const bp = getBlueprint()
console.log('Materials status before build:', JSON.stringify(lib.materials(bp)))

// Run lib.build with our 9 sandstone
const report = await lib.build(bp, { replace: true })
console.log('Build report:', JSON.stringify(report))

const mat = lib.materials(bp)
console.log('Materials status after build:', JSON.stringify(mat.need))

// Check door at (12, 67, -21)
const doorBlock = bot.blockAt(new Vec3(12, 67, -21))
console.log('Door at (12, 67, -21):', doorBlock?.name)

// Check if beta is nearby
const beta = bot.players.beta?.entity
if (beta) {
  console.log('Beta pos:', lib.fmt(beta.position))
}

const t = lib.time()
console.log(`TIME: ${t.timeOfDay} (${t.phase}) | night in ${t.secondsUntilNight}s`)

bot.chat(`alpha: Placed ${report.placed} blocks! Walls complete? Need: ${JSON.stringify(mat.need)}`)

return lib.status()
