// programs/048-place-5-sandstone.js
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

const report = await lib.build(bp, { replace: true })
console.log('Build report:', JSON.stringify(report))

const matAfter = lib.materials(bp)
console.log('Materials remaining:', JSON.stringify(matAfter.need))

const beta = bot.players.beta?.entity
console.log('Beta pos:', beta ? lib.fmt(beta.position) : 'unknown')

bot.chat(`alpha: Placed ${report.placed} roof blocks! Remaining blocks needed: ${JSON.stringify(matAfter.need)}`)

return lib.status()
