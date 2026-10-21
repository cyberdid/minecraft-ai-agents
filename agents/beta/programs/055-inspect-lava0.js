// Check blocks around Lava 0
const b = bot
const lavaPos = new Vec3(344, -55, -31)
console.log('Lava at:', lavaPos, b.blockAt(lavaPos)?.name)
console.log('Under lava:', b.blockAt(lavaPos.offset(0, -1, 0))?.name)
console.log('Above lava:', b.blockAt(lavaPos.offset(0, 1, 0))?.name)
for (let [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  console.log(`Adjacent (${dx}, ${dz}):`, b.blockAt(lavaPos.offset(dx, 0, dz))?.name, 'above adjacent:', b.blockAt(lavaPos.offset(dx, 1, dz))?.name)
}
