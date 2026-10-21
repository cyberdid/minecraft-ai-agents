// Inspect walls around (350, -54, -28)
const b = bot
const targetAir = new Vec3(350, -54, -28)
for (let [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  const p = targetAir.offset(dx, 0, dz)
  console.log(`Wall at ${p}:`, b.blockAt(p)?.name)
}
