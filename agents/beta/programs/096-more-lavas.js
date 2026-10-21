const lavas = bot.findBlocks({
  matching: b => b.name === 'lava' && b.metadata === 0,
  maxDistance: 32,
  count: 50
})
console.log('Lava sources found:', lavas.length)
for (const p of lavas) {
  const below = bot.blockAt(p.offset(0, -1, 0))
  const above = bot.blockAt(p.offset(0, 1, 0))
  console.log(`(${p.x}, ${p.y}, ${p.z}) | above: ${above ? above.name : 'null'}, below: ${below ? below.name : 'null'}`)
}
