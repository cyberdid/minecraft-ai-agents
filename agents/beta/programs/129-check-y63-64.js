const air63 = []
const air64 = []
for (let dx = -8; dx <= 8; dx++) {
  for (let dz = -8; dz <= 8; dz++) {
    const p63 = new Vec3(345 + dx, 63, -32 + dz)
    const b63 = bot.blockAt(p63)
    const below63 = bot.blockAt(p63.offset(0, -1, 0))
    if (b63 && b63.name === 'air' && below63 && below63.boundingBox === 'block') {
      air63.push(`(${p63.x},63,${p63.z}) on ${below63.name}`)
    }
    const p64 = new Vec3(345 + dx, 64, -32 + dz)
    const b64 = bot.blockAt(p64)
    const below64 = bot.blockAt(p64.offset(0, -1, 0))
    if (b64 && b64.name === 'air' && below64 && below64.boundingBox === 'block') {
      air64.push(`(${p64.x},64,${p64.z}) on ${below64.name}`)
    }
  }
}
console.log('Walkable spots at y=63:')
console.log(air63.join('\n'))
console.log('Walkable spots at y=64:')
console.log(air64.slice(0, 10).join('\n'))
