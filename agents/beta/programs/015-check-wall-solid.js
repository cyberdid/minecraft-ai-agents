// Check if the wall at z=-31 is solid for steps 6 to 10
const b = bot
for (let i = 6; i <= 10; i++) {
  const x = 367 - i
  const y = -38 - i
  for (let dy = 0; dy <= 2; dy++) {
    const p = new Vec3(x, y + dy, -31)
    console.log(`Wall at (${p.x}, ${p.y}, ${p.z}):`, b.blockAt(p)?.name)
  }
}
