// Find lava blocks nearby
const b = bot
const lava = b.findBlocks({
  matching: bl => bl && (bl.name === 'lava' || bl.name === 'flowing_lava'),
  maxDistance: 16,
  count: 30
})
console.log('Lava blocks count:', lava.length)
for (let i = 0; i < Math.min(10, lava.length); i++) {
  const p = lava[i]
  const bl = b.blockAt(p)
  console.log(`Lava ${i} (${bl.name}, meta=${bl.metadata}) at:`, p, 'above:', b.blockAt(p.offset(0, 1, 0))?.name)
}
return { lavaCount: lava.length }
