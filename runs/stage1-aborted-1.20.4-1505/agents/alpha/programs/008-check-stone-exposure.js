const allStone = bot.findBlocks({
  matching: b => b.name === 'stone' || b.name === 'cobblestone',
  maxDistance: 64,
  count: 20
})

console.log(`Checking ${allStone.length} stone blocks for air neighbors:`)
for (const p of allStone) {
  const neighbors = [
    bot.blockAt(p.offset(0, 1, 0)),
    bot.blockAt(p.offset(1, 0, 0)),
    bot.blockAt(p.offset(-1, 0, 0)),
    bot.blockAt(p.offset(0, 0, 1)),
    bot.blockAt(p.offset(0, 0, -1)),
  ]
  const exposedToAir = neighbors.some(n => n && (n.name === 'air' || n.name === 'cave_air'))
  if (exposedToAir) {
    console.log(`Exposed stone at ${lib.fmt(p)} (y=${p.y}, dist=${Math.round(bot.entity.position.distanceTo(p))})`)
  }
}
