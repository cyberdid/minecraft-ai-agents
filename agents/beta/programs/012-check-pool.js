// Check around the lava pool at (350, -55, -30)
const b = bot
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    const x = 350 + dx
    const z = -30 + dz
    const bl55 = b.blockAt(new Vec3(x, -55, z))?.name
    const bl54 = b.blockAt(new Vec3(x, -54, z))?.name
    console.log(`(${x}, z=${z}): y=-55:${bl55}, y=-54:${bl54}`)
  }
}
