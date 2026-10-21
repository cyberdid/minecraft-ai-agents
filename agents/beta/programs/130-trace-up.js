const p = new Vec3(348, 63, -31)
console.log('Inspecting upwards from (348, 63, -31):')
for (let dy = 0; dy <= 12; dy++) {
  for (let dx = -3; dx <= 3; dx++) {
    for (let dz = -3; dz <= 3; dz++) {
      const pos = p.offset(dx, dy, dz)
      const b = bot.blockAt(pos)
      const below = bot.blockAt(pos.offset(0, -1, 0))
      if (b && b.name === 'air' && below && below.boundingBox === 'block') {
        console.log(`y=${pos.y}: (${pos.x}, ${pos.y}, ${pos.z}) on ${below.name}`)
      }
    }
  }
}
