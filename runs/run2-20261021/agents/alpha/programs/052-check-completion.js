// programs/052-check-completion.js
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
const mat = lib.materials(bp)
console.log('Materials currently needed:', JSON.stringify(mat.need))

const beta = bot.players.beta?.entity
console.log('Beta pos:', beta ? lib.fmt(beta.position) : 'unknown')

return { mat: mat.need, beta: !!beta }
