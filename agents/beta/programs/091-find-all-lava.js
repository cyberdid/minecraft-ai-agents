const lavaBlocks = bot.findBlocks({
  matching: b => b.name === 'lava' && b.metadata === 0,
  maxDistance: 16,
  count: 30
})
console.log('Lava sources (meta 0) found:', lavaBlocks.length)
for (const p of lavaBlocks) {
  const below = bot.blockAt(p.offset(0, -1, 0))
  console.log(`Lava source at (${p.x}, ${p.y}, ${p.z}) | below: ${below ? below.name : 'null'}`)
}
return lavaBlocks
