const pools = bot.findBlocks({ matching: (bl) => bl && bl.name === 'lava' && bl.metadata === 0, maxDistance: 48, count: 64 })
  .map((p) => bot.blockAt(p)).filter(Boolean)
  .sort((x, y) => x.position.distanceTo(bot.entity.position) - y.position.distanceTo(bot.entity.position))
console.log('Total pools found:', pools.length)
let edge = null
for (const lava of pools) {
  const up = bot.blockAt(lava.position.offset(0, 1, 0))
  if (!up || up.name !== 'air') continue
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nb = bot.blockAt(lava.position.offset(dx, 0, dz))
    const nbUp = bot.blockAt(lava.position.offset(dx, 1, dz))
    if (nb && nb.boundingBox === 'block' && nbUp && nbUp.name === 'air') {
      edge = { lava: lava.position, edge: nb.position }
      console.log(`Found candidate edge: lava at ${lava.position}, edge at ${nb.position}`)
      break
    }
  }
  if (edge) break
}
console.log('Result edge:', edge)
