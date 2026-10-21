// Check candidate edges for makeObsidian
const b = bot
const pools = b.findBlocks({ matching: (bl) => bl && bl.name === 'lava' && bl.metadata === 0, maxDistance: 48, count: 64 })
  .map((p) => b.blockAt(p)).filter(Boolean)
  .sort((x, y) => x.position.distanceTo(bot.entity.position) - y.position.distanceTo(bot.entity.position))

console.log('Total lava source blocks found:', pools.length)

let edge = null
for (const lava of pools) {
  const up = b.blockAt(lava.position.offset(0, 1, 0))
  if (!up || up.name !== 'air') continue
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nb = b.blockAt(lava.position.offset(dx, 0, dz))
    const nbUp = b.blockAt(lava.position.offset(dx, 1, dz))
    if (nb && nb.boundingBox === 'block' && nbUp && nbUp.name === 'air') {
      edge = nb
      console.log('Found edge at:', edge.position, 'next to lava at:', lava.position)
      break
    }
  }
  if (edge) break
}

if (!edge) {
  console.log('No open surface edge found! Let us see some lava blocks:')
  for (let i = 0; i < Math.min(5, pools.length); i++) {
    const l = pools[i]
    const up = b.blockAt(l.position.offset(0, 1, 0))
    console.log(`Lava ${i}:`, l.position, 'above:', up?.name)
  }
}
return { edge: edge?.position }
