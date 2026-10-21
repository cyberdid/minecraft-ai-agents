// Check floor heights from y=-48 downwards
const b = bot
for (let x = 357; x >= 350; x--) {
  let floorY = null
  for (let y = -48; y >= -60; y--) {
    const bl = b.blockAt(new Vec3(x, y, -30))
    if (bl && bl.boundingBox === 'block') {
      floorY = y
      console.log(`x=${x}, z=-30: floor at y=${y} (${bl.name})`)
      break
    }
  }
  if (floorY === null) console.log(`x=${x}, z=-30: no solid floor above -60`)
}
