// programs/035-climb-to-surface.js
const p = bot.entity.position
console.log('alpha at:', lib.fmt(p))

// Inspect blocks around (31, 63, -45)
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    const x = Math.floor(p.x + dx)
    const z = Math.floor(p.z + dz)
    let y = 70
    while (y > 55 && bot.blockAt(new Vec3(x, y, z))?.boundingBox !== 'block') y--
    console.log(`(${x}, ${z}) surface y=${y}: ${bot.blockAt(new Vec3(x, y, z))?.name}`)
  }
}
