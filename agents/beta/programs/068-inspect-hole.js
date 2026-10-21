// Check the hole at (349, -55, -31)
const b = bot
const hole = new Vec3(349, -55, -31)
console.log('Hole at', hole, 'is:', b.blockAt(hole)?.name)
console.log('Under hole is:', b.blockAt(hole.offset(0, -1, 0))?.name)
for (let [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  console.log(`Adjacent (${dx}, ${dz}):`, b.blockAt(hole.offset(dx, 0, dz))?.name)
}
