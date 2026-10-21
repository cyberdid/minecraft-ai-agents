// Check column at (350, y, -30)
const b = bot
for (let y = -48; y >= -56; y--) {
  const bl = b.blockAt(new Vec3(350, y, -30))
  console.log(`(350, ${y}, -30):`, bl?.name)
}
