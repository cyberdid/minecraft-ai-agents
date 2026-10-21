// programs/054-verify-and-celebrate.js
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
let mat = lib.materials(bp)
console.log('Materials check:', JSON.stringify(mat.need))

if (mat.need && mat.need.sandstone > 0) {
  console.log(`Still need ${mat.need.sandstone} sandstone. Gathering sand and crafting...`)
  const neededSand = mat.need.sandstone * 4
  const sandBlocks = lib.find('sand', { maxDistance: 10, count: 8 })
    .filter(b => b.position.x <= 9 || b.position.x >= 15 || b.position.z >= -19)
  
  for (const b of sandBlocks) {
    if (lib.count('sand') >= neededSand) break
    try {
      await lib.dig(b.position.x, b.position.y, b.position.z)
      await lib.pickup(4)
    } catch (e) {
      console.log('dig err:', e.message)
    }
  }
  await lib.pickup(6)
  
  await lib.clearCraftingGrid()
  await lib.stowCursor()
  
  const toCraft = Math.floor(lib.count('sand') / 4)
  if (toCraft > 0) {
    try {
      await lib.craft('sandstone', toCraft)
    } catch (e) {
      console.log('craft err:', e.message)
    }
  }
  
  console.log('Placing remaining block(s)...')
  const report = await lib.build(bp, { replace: true })
  console.log('Build report:', JSON.stringify(report))
  mat = lib.materials(bp)
}

console.log('FINAL VERIFICATION: Remaining needed blocks:', JSON.stringify(mat.need))

if (Object.keys(mat.need).length === 0) {
  bot.chat("alpha: VERIFIED 100% COMPLETE! The 5x5 sandstone house at (10, 67, -25) is fully built: 4 sandstone walls, solid sandstone roof, window openings, and an oak entrance door at (12, 67, -21). Great teamwork beta!")
}

return { need: mat.need, complete: Object.keys(mat.need).length === 0 }
