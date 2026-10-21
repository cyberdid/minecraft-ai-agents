// Inspect the direct descent line to the lava edge
const b = bot
const inspect = []
for (let i = 1; i <= 17; i++) {
  const x = 367 - i
  const y = -38 - i
  const z = -30
  const head = b.blockAt(new Vec3(x, y + 2, z))?.name
  const body = b.blockAt(new Vec3(x, y + 1, z))?.name
  const feet = b.blockAt(new Vec3(x, y, z))?.name
  const under = b.blockAt(new Vec3(x, y - 1, z))?.name
  inspect.push(`Step ${i} (${x}, ${y}, ${z}): feet=${feet}, under=${under}, body=${body}, head=${head}`)
}
console.log(inspect.join('\n'))
