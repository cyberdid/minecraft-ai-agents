// Inspect blocks around step 10 to 13
const b = bot
for (let i = 10; i <= 13; i++) {
  const x = 367 - i
  const y = -38 - i
  console.log(`Step ${i} at (${x}, ${y}, -30):`)
  for (let dz of [-1, 0, 1]) {
    const p = new Vec3(x, y, -30 + dz)
    console.log(`  z=${-30 + dz}: feet=${b.blockAt(p)?.name}, under=${b.blockAt(p.offset(0, -1, 0))?.name}`)
  }
}
