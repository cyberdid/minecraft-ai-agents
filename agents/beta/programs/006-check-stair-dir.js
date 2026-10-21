// Check the staircase orientation at our feet
const p = bot.entity.position.floored()
console.log('Current foot position:', p)
for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  const up = bot.blockAt(p.offset(dx, 1, dz))
  const at = bot.blockAt(p.offset(dx, 0, dz))
  const down = bot.blockAt(p.offset(dx, -1, dz))
  console.log(`Direction (${dx}, ${dz}): up=${up?.name}, at=${at?.name}, down=${down?.name}`)
}
