// Check the 7 steps to the lava chamber
const b = bot
for (let i = 1; i <= 7; i++) {
  const x = 357 - i
  const y = -48 - Math.min(i, 6)
  const z = -30
  const feet = b.blockAt(new Vec3(x, y, z))?.name
  const body = b.blockAt(new Vec3(x, y + 1, z))?.name
  const head = b.blockAt(new Vec3(x, y + 2, z))?.name
  const under = b.blockAt(new Vec3(x, y - 1, z))?.name
  console.log(`Step ${i} (${x}, ${y}, ${z}): feet=${feet}, under=${under}, body=${body}, head=${head}`)
}
