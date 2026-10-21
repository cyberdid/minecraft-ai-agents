// Check ground heights along x=350..357, z=-30 and z=-29
const b = bot
for (let x = 357; x >= 350; x--) {
  let groundY = null
  for (let y = -45; y >= -60; y--) {
    const bl = b.blockAt(new Vec3(x, y, -30))
    if (bl && bl.boundingBox === 'block') {
      groundY = y
      console.log(`x=${x}, z=-30: solid block at y=${y} (${bl.name})`)
      break
    }
  }
  if (groundY === null) console.log(`x=${x}, z=-30: no solid block above -60`)
}
