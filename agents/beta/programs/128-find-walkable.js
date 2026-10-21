const air = []
for (let dx = -16; dx <= 16; dx++) {
  for (let dy = -2; dy <= 4; dy++) {
    for (let dz = -16; dz <= 16; dz++) {
      const p = bot.entity.position.offset(dx, dy, dz).floored()
      const b = bot.blockAt(p)
      if (b && b.name === 'air') {
        const below = bot.blockAt(p.offset(0, -1, 0))
        if (below && below.boundingBox === 'block') {
          air.push({ x: p.x, y: p.y, z: p.z, floor: below.name })
        }
      }
    }
  }
}
console.log(`Found ${air.length} walkable air positions within 16 blocks:`)
// Group by y
const byY = {}
for (const a of air) {
  byY[a.y] = (byY[a.y] || 0) + 1
}
console.log('Walkable spots by Y:', byY)
