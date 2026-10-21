// programs/007-check-area.js
const p = bot.entity.position
console.log('alpha at:', lib.fmt(p))

// Let's check what blocks exist nearby on the surface
const blockNames = new Set()
for (let dx = -20; dx <= 20; dx += 4) {
  for (let dz = -20; dz <= 20; dz += 4) {
    const x = Math.floor(p.x + dx)
    const z = Math.floor(p.z + dz)
    let y = 80
    while (y > 50 && bot.blockAt(new Vec3(x, y, z))?.boundingBox !== 'block') y--
    const b = bot.blockAt(new Vec3(x, y, z))
    if (b) blockNames.add(`${b.name} (y=${y})`)
  }
}
console.log('Surface blocks around alpha:', Array.from(blockNames).join(', '))

// Also check where beta is heading
const beta = bot.players.beta?.entity
console.log('beta pos:', beta ? lib.fmt(beta.position) : 'unknown')
