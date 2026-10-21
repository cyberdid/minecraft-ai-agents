const p = bot.entity.position
console.log('Bot pos:', p)
for (let dy = -2; dy <= 1; dy++) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const pos = p.offset(dx, dy, dz).floored()
      const b = bot.blockAt(pos)
      if (b && b.name !== 'air') {
        console.log(`(${pos.x},${pos.y},${pos.z}) = ${b.name}`)
      }
    }
  }
}
