// Test finding edge for makeObsidian
const b = bot
const pools = b.findBlocks({ matching: (bl) => bl && bl.name === 'lava' && bl.metadata === 0, maxDistance: 48, count: 64 })
  .map((p) => b.blockAt(p)).filter(Boolean)
  .sort((x, y) => x.position.distanceTo(bot.entity.position) - y.position.distanceTo(bot.entity.position))

let edge = null
let targetLava = null
for (const lava of pools) {
  const up = b.blockAt(lava.position.offset(0, 1, 0))
  if (!up || up.name !== 'air') continue
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nb = b.blockAt(lava.position.offset(dx, 0, dz))
    const nbUp = b.blockAt(lava.position.offset(dx, 1, dz))
    if (nb && nb.boundingBox === 'block' && nbUp && nbUp.name === 'air') {
      edge = nb
      targetLava = lava
      break
    }
  }
  if (edge) break
}
console.log('Found edge:', edge?.position, 'target lava:', targetLava?.position)
return { edge: edge?.position, targetLava: targetLava?.position }
