const p = bot.entity.position.floored()
console.log('Bot pos:', p)
const airBlocks = []
for (let dy = -1; dy <= 2; dy++) {
  for (let dx = -3; dx <= 3; dx++) {
    for (let dz = -3; dz <= 3; dz++) {
      const pos = p.offset(dx, dy, dz)
      const b = bot.blockAt(pos)
      if (b && b.name === 'air') {
        airBlocks.push(`${pos.x},${pos.y},${pos.z}`)
      }
    }
  }
}
console.log('Air blocks in corridor:')
console.log(airBlocks.join('; '))
