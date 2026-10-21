// Inspect obsidian block at (347, -56, -30)
const b = bot
const p = new Vec3(347, -56, -30)
console.log('Obsidian at:', p, b.blockAt(p)?.name)
console.log('Under is:', b.blockAt(p.offset(0, -1, 0))?.name)
console.log('Above is:', b.blockAt(p.offset(0, 1, 0))?.name)
for (let [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  console.log(`Adjacent (${dx}, ${dz}):`, b.blockAt(p.offset(dx, 0, dz))?.name)
}
