const positions = bot.findBlocks({
  matching: b => b && b.name === 'water' && b.metadata === 0,
  maxDistance: 128,
  count: 100
})

const surfaceSources = positions
  .filter(p => p.y >= 60 && bot.blockAt(p.offset(0, 1, 0))?.name === 'air')
  .sort((a, b) => a.distanceTo(bot.entity.position) - b.distanceTo(bot.entity.position))

console.log(`Surface water sources (y>=60): ${surfaceSources.length}`)
for (const p of surfaceSources.slice(0, 5)) {
  console.log(`  ${lib.fmt(p)} dist ${p.distanceTo(bot.entity.position).toFixed(1)}`)
}
