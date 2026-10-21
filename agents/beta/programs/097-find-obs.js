const obs = bot.findBlocks({
  matching: b => b.name === 'obsidian',
  maxDistance: 32,
  count: 30
})
console.log('Obsidian blocks found:', obs.length)
for (const p of obs) {
  const below = bot.blockAt(p.offset(0, -1, 0))
  const above = bot.blockAt(p.offset(0, 1, 0))
  console.log(`(${p.x}, ${p.y}, ${p.z}) | above: ${above ? above.name : 'null'}, below: ${below ? below.name : 'null'}`)
}
