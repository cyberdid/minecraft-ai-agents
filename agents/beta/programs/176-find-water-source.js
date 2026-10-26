console.log('Searching for surface water sources up to 128 blocks...')
const sources = bot.findBlocks({
  matching: bl => bl && bl.name === 'water' && bl.metadata === 0,
  maxDistance: 128,
  count: 50
}).map(p => bot.blockAt(p))
  .filter(bl => bl && bot.blockAt(bl.position.offset(0, 1, 0))?.name === 'air')
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position))

console.log(`Found ${sources.length} open surface water sources:`)
for (let i = 0; i < Math.min(5, sources.length); i++) {
  const p = sources[i].position
  console.log(`  Source ${i+1}: ${lib.fmt(p)} dist: ${p.distanceTo(bot.entity.position).toFixed(1)}`)
}
