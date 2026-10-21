// Check column at (349, y, -30)
const b = bot
for (let y = -48; y >= -56; y--) {
  const bl = b.blockAt(new Vec3(349, y, -30))
  console.log(`(349, ${y}, -30):`, bl?.name)
}
