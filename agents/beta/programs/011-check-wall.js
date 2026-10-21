// Check blocks between our staircase line and creeper
const b = bot
for (let z = -30; z >= -34; z--) {
  const bl = b.blockAt(new Vec3(361, -47, z))
  console.log(`(361, -47, ${z}):`, bl?.name)
}
